package io.ssafy.payment.domain.billing.service;

import com.fasterxml.jackson.databind.JsonNode;
import io.ssafy.payment.domain.billing.dto.response.ReceiptOcrDraftResponseDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ClovaReceiptMapper {

    private static final Pattern BUSINESS_NUMBER_PATTERN = Pattern.compile("\\d{3}-?\\d{2}-?\\d{5}");
    private static final Pattern NUMBER_PATTERN = Pattern.compile("-?\\d+(?:[.,]\\d+)?");
    private static final Pattern DATE_TIME_PATTERN = Pattern.compile(
            "(20\\d{2})[./-](\\d{1,2})[./-](\\d{1,2})(?:\\s+|T)?(\\d{1,2})?:?(\\d{1,2})?:?(\\d{1,2})?"
    );

    public ReceiptOcrDraftResponseDto map(ClovaReceiptOcrClient.ClovaReceiptOcrRawResult rawResult) {
        JsonNode root = rawResult.rawResponse();
        JsonNode imageRoot = root.path("images").isArray() && !root.path("images").isEmpty()
                ? root.path("images").get(0)
                : root;

        JsonNode receiptResult = firstNonMissing(
                imageRoot.path("receipt").path("result"),
                imageRoot.path("result"),
                root.path("receipt").path("result"),
                root.path("result")
        );

        if (receiptResult == null || receiptResult.isMissingNode() || receiptResult.isNull()) {
            receiptResult = root;
        }

        String merchantName = firstNonBlank(
                textAt(receiptResult, "storeInfo", "name", "formatted", "value"),
                textAt(receiptResult, "storeInfo", "name", "text"),
                textAt(receiptResult, "storeInfo", "subName", "text"),
                textAt(receiptResult, "merchantName"),
                firstTextByFieldName(receiptResult, Set.of("merchantName", "storeName"))
        );

        String address = firstNonBlank(
                textAt(receiptResult, "storeInfo", "addresses", 0, "formatted", "value"),
                textAt(receiptResult, "storeInfo", "addresses", 0, "text"),
                textAt(receiptResult, "storeInfo", "address", "text"),
                textAt(receiptResult, "address"),
                firstTextByFieldName(receiptResult, Set.of("address", "roadAddress", "jibunAddress"))
        );

        String businessNumber = normalizeBusinessNumber(firstNonBlank(
                textAt(receiptResult, "storeInfo", "bizNum", "formatted", "value"),
                textAt(receiptResult, "storeInfo", "bizNum", "text"),
                textAt(receiptResult, "businessNumber"),
                firstBusinessNumber(receiptResult)
        ));

        String paidAt = normalizePaidAt(firstNonBlank(
                combineDateTime(
                        textAt(receiptResult, "paymentInfo", "date", "text"),
                        textAt(receiptResult, "paymentInfo", "time", "text")
                ),
                textAt(receiptResult, "paymentInfo", "date", "formatted", "value"),
                textAt(receiptResult, "paymentInfo", "approvedAt", "text"),
                textAt(receiptResult, "paidAt"),
                firstTextByFieldName(receiptResult, Set.of("paidAt", "approvedAt", "date", "time"))
        ));

        BigDecimal totalAmount = firstNonNull(
                decimalAt(receiptResult, "totalPrice", "price", "formatted", "value"),
                decimalAt(receiptResult, "totalPrice", "price", "text"),
                decimalAt(receiptResult, "paymentInfo", "totalPrice", "text"),
                decimalAt(receiptResult, "totalAmount"),
                firstDecimalByFieldName(receiptResult, Set.of("totalAmount", "totalPrice", "price"))
        );

        List<ReceiptOcrDraftResponseDto.ItemDto> items = extractItems(receiptResult);
        Map<String, List<Object>> candidates = buildCandidates(receiptResult, merchantName, paidAt, totalAmount);

        String inferResult = firstNonBlank(
                textAt(imageRoot, "inferResult"),
                textAt(root, "inferResult")
        );

        return new ReceiptOcrDraftResponseDto(
                merchantName,
                address,
                paidAt,
                businessNumber,
                totalAmount,
                items,
                candidates,
                new ReceiptOcrDraftResponseDto.OcrMetaDto(
                        "NAVER_CLOVA",
                        rawResult.requestId(),
                        inferResult
                )
        );
    }

    private List<ReceiptOcrDraftResponseDto.ItemDto> extractItems(JsonNode receiptResult) {
        List<ReceiptOcrDraftResponseDto.ItemDto> items = new ArrayList<>();
        List<JsonNode> itemNodes = new ArrayList<>();

        collectArrayNodes(receiptResult.path("subResults"), "items", itemNodes);
        if (itemNodes.isEmpty()) {
            collectDirectItems(receiptResult.path("items"), itemNodes);
        }

        for (JsonNode itemNode : itemNodes) {
            String name = firstNonBlank(
                    textAt(itemNode, "name", "formatted", "value"),
                    textAt(itemNode, "name", "text"),
                    textAt(itemNode, "name"),
                    firstTextByFieldName(itemNode, Set.of("name", "itemName", "menu"))
            );

            BigDecimal unitPrice = firstNonNull(
                    decimalAt(itemNode, "price", "unitPrice", "formatted", "value"),
                    decimalAt(itemNode, "price", "unitPrice", "text"),
                    decimalAt(itemNode, "unitPrice", "text"),
                    decimalAt(itemNode, "price", "text"),
                    firstDecimalByFieldName(itemNode, Set.of("unitPrice"))
            );

            Integer quantity = firstNonNull(
                    integerAt(itemNode, "count", "formatted", "value"),
                    integerAt(itemNode, "count", "text"),
                    integerAt(itemNode, "quantity", "text"),
                    integerAt(itemNode, "count"),
                    firstIntegerByFieldName(itemNode, Set.of("count", "quantity", "qty"))
            );

            BigDecimal amount = firstNonNull(
                    decimalAt(itemNode, "price", "price", "formatted", "value"),
                    decimalAt(itemNode, "price", "price", "text"),
                    decimalAt(itemNode, "itemTotal", "text"),
                    decimalAt(itemNode, "amount", "text"),
                    firstDecimalByFieldName(itemNode, Set.of("amount", "itemTotal", "totalPrice"))
            );

            if (isBlank(name) && unitPrice == null && quantity == null && amount == null) {
                continue;
            }

            items.add(new ReceiptOcrDraftResponseDto.ItemDto(
                    name,
                    unitPrice,
                    quantity,
                    amount,
                    List.of()
            ));
        }

        return items;
    }

    private Map<String, List<Object>> buildCandidates(
            JsonNode receiptResult,
            String merchantName,
            String paidAt,
            BigDecimal totalAmount
    ) {
        Map<String, List<Object>> candidates = new LinkedHashMap<>();

        List<Object> merchantCandidates = uniqueObjects(candidateList(
                merchantName,
                textAt(receiptResult, "storeInfo", "name", "formatted", "value"),
                textAt(receiptResult, "storeInfo", "name", "text"),
                textAt(receiptResult, "storeInfo", "subName", "text"),
                firstTextByFieldName(receiptResult, Set.of("merchantName", "storeName"))
        ));
        if (!merchantCandidates.isEmpty()) {
            candidates.put("merchantName", merchantCandidates);
        }

        List<Object> paidAtCandidates = uniqueObjects(candidateList(
                paidAt,
                combineDateTime(
                        textAt(receiptResult, "paymentInfo", "date", "text"),
                        textAt(receiptResult, "paymentInfo", "time", "text")
                ),
                textAt(receiptResult, "paymentInfo", "approvedAt", "text")
        ));
        if (!paidAtCandidates.isEmpty()) {
            candidates.put("paidAt", paidAtCandidates);
        }

        List<Object> totalAmountCandidates = uniqueObjects(candidateList(
                totalAmount,
                decimalAt(receiptResult, "totalPrice", "price", "formatted", "value"),
                decimalAt(receiptResult, "totalPrice", "price", "text"),
                decimalAt(receiptResult, "paymentInfo", "totalPrice", "text")
        ));
        if (!totalAmountCandidates.isEmpty()) {
            candidates.put("totalAmount", totalAmountCandidates);
        }

        return candidates;
    }

    private List<Object> candidateList(Object... values) {
        List<Object> result = new ArrayList<>();
        for (Object value : values) {
            result.add(value);
        }
        return result;
    }

    private void collectArrayNodes(JsonNode subResults, String fieldName, List<JsonNode> sink) {
        if (!subResults.isArray()) {
            return;
        }

        for (JsonNode subResult : subResults) {
            collectDirectItems(subResult.path(fieldName), sink);
        }
    }

    private void collectDirectItems(JsonNode itemsNode, List<JsonNode> sink) {
        if (!itemsNode.isArray()) {
            return;
        }
        itemsNode.forEach(sink::add);
    }

    private JsonNode firstNonMissing(JsonNode... nodes) {
        for (JsonNode node : nodes) {
            if (node != null && !node.isMissingNode() && !node.isNull()) {
                return node;
            }
        }
        return null;
    }

    private String textAt(JsonNode node, Object... path) {
        JsonNode current = node;
        for (Object part : path) {
            if (current == null || current.isMissingNode() || current.isNull()) {
                return null;
            }
            if (part instanceof Integer index) {
                current = current.isArray() && current.size() > index ? current.get(index) : null;
            } else {
                current = current.path(String.valueOf(part));
            }
        }

        return asText(current);
    }

    private String asText(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        if (node.isTextual() || node.isNumber() || node.isBoolean()) {
            String value = node.asText();
            return isBlank(value) ? null : value.trim();
        }
        if (node.isObject()) {
            return firstNonBlank(
                    asText(node.get("text")),
                    asText(node.get("formatted")),
                    asText(node.get("value")),
                    asText(node.get("inferText"))
            );
        }
        return null;
    }

    private String firstTextByFieldName(JsonNode node, Set<String> fieldNames) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        if (node.isObject()) {
            for (String fieldName : iterable(node.fieldNames())) {
                JsonNode child = node.get(fieldName);
                if (fieldNames.contains(fieldName)) {
                    String direct = asText(child);
                    if (!isBlank(direct)) {
                        return direct;
                    }
                }
                String nested = firstTextByFieldName(child, fieldNames);
                if (!isBlank(nested)) {
                    return nested;
                }
            }
        } else if (node.isArray()) {
            for (JsonNode child : node) {
                String nested = firstTextByFieldName(child, fieldNames);
                if (!isBlank(nested)) {
                    return nested;
                }
            }
        }
        return null;
    }

    private String firstBusinessNumber(JsonNode node) {
        String text = firstTextByFieldName(node, Set.of("bizNum", "businessNumber", "registrationNumber"));
        if (!isBlank(text)) {
            return text;
        }
        String merged = node == null ? "" : node.toString();
        Matcher matcher = BUSINESS_NUMBER_PATTERN.matcher(merged);
        return matcher.find() ? matcher.group() : null;
    }

    private BigDecimal decimalAt(JsonNode node, Object... path) {
        return toBigDecimal(textAt(node, path));
    }

    private Integer integerAt(JsonNode node, Object... path) {
        BigDecimal decimal = toBigDecimal(textAt(node, path));
        return decimal == null ? null : decimal.intValue();
    }

    private BigDecimal firstDecimalByFieldName(JsonNode node, Set<String> fieldNames) {
        String text = firstTextByFieldName(node, fieldNames);
        return toBigDecimal(text);
    }

    private Integer firstIntegerByFieldName(JsonNode node, Set<String> fieldNames) {
        BigDecimal decimal = firstDecimalByFieldName(node, fieldNames);
        return decimal == null ? null : decimal.intValue();
    }

    private BigDecimal toBigDecimal(String raw) {
        if (isBlank(raw)) {
            return null;
        }
        Matcher matcher = NUMBER_PATTERN.matcher(raw.replace(",", ""));
        if (!matcher.find()) {
            return null;
        }
        try {
            return new BigDecimal(matcher.group());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String combineDateTime(String date, String time) {
        if (isBlank(date) && isBlank(time)) {
            return null;
        }
        if (isBlank(time)) {
            return date;
        }
        if (isBlank(date)) {
            return time;
        }
        return date + " " + time;
    }

    private String normalizeBusinessNumber(String raw) {
        if (isBlank(raw)) {
            return null;
        }
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.length() != 10) {
            return raw;
        }
        return digits.substring(0, 3) + "-" + digits.substring(3, 5) + "-" + digits.substring(5);
    }

    private String normalizePaidAt(String raw) {
        if (isBlank(raw)) {
            return null;
        }

        String sanitized = raw.trim()
                .replaceAll("\\s*:\\s*", ":")
                .replaceAll("\\s+", " ");

        List<DateTimeFormatter> dateTimeFormatters = List.of(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
                DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm"),
                DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm")
        );

        for (DateTimeFormatter formatter : dateTimeFormatters) {
            try {
                LocalDateTime parsed = LocalDateTime.parse(sanitized, formatter);
                return parsed.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (DateTimeParseException ignored) {
            }
        }

        List<DateTimeFormatter> dateFormatters = List.of(
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("yyyy.MM.dd"),
                DateTimeFormatter.ofPattern("yyyy/MM/dd")
        );
        for (DateTimeFormatter formatter : dateFormatters) {
            try {
                LocalDate parsed = LocalDate.parse(sanitized, formatter);
                return parsed.atStartOfDay().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (DateTimeParseException ignored) {
            }
        }

        Matcher matcher = DATE_TIME_PATTERN.matcher(sanitized);
        if (matcher.find()) {
            try {
                int year = Integer.parseInt(matcher.group(1));
                int month = Integer.parseInt(matcher.group(2));
                int day = Integer.parseInt(matcher.group(3));
                int hour = matcher.group(4) == null ? 0 : Integer.parseInt(matcher.group(4));
                int minute = matcher.group(5) == null ? 0 : Integer.parseInt(matcher.group(5));
                int second = matcher.group(6) == null ? 0 : Integer.parseInt(matcher.group(6));

                return LocalDateTime.of(year, month, day, hour, minute, second)
                        .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (DateTimeException | NumberFormatException ignored) {
            }
        }

        return raw;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (!isBlank(value)) {
                return value;
            }
        }
        return null;
    }

    @SafeVarargs
    private final <T> T firstNonNull(T... values) {
        for (T value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private List<Object> uniqueObjects(List<?> values) {
        Set<Object> unique = new LinkedHashSet<>();
        for (Object value : values) {
            if (value == null) {
                continue;
            }
            if (value instanceof String stringValue && isBlank(stringValue)) {
                continue;
            }
            unique.add(value);
        }
        return new ArrayList<>(unique);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private Iterable<String> iterable(java.util.Iterator<String> iterator) {
        List<String> keys = new ArrayList<>();
        iterator.forEachRemaining(keys::add);
        return keys;
    }
}