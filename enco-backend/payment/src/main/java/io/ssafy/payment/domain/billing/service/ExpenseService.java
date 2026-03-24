package io.ssafy.payment.domain.billing.service;

import io.ssafy.payment.domain.billing.dto.request.CreateExpenseRequestDto;
import io.ssafy.payment.domain.billing.dto.request.CreateExpenseRequestDto.PaymentInfoDto;
import io.ssafy.payment.domain.billing.dto.response.ExpenseResponseDto;
import io.ssafy.payment.domain.billing.dto.response.SettlementDefaultersResponseDto;
import io.ssafy.payment.domain.billing.dto.response.SettlementDetailResponseDto;
import io.ssafy.payment.domain.billing.entity.Charge;
import io.ssafy.payment.domain.billing.entity.ChargeTarget;
import io.ssafy.payment.domain.billing.entity.ChargeType;
import io.ssafy.payment.domain.billing.entity.Expense;
import io.ssafy.payment.domain.billing.entity.Receipt;
import io.ssafy.payment.domain.billing.entity.ReceiptItem;
import io.ssafy.payment.domain.billing.entity.ReceiptItemOption;
import io.ssafy.payment.domain.billing.repository.ChargeRepository;
import io.ssafy.payment.domain.billing.repository.ChargeTargetRepository;
import io.ssafy.payment.domain.billing.repository.ExpenseRepository;
import io.ssafy.payment.domain.billing.repository.ReceiptRepository;
import io.ssafy.payment.global.common.BankCode;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ChargeRepository chargeRepository;
    private final ChargeTargetRepository chargeTargetRepository;
    private final ReceiptRepository receiptRepository;
    private final ReceiptService receiptService;

    @Transactional
    public ExpenseResponseDto createExpense(Long groupId, Long userId, MultipartFile file, CreateExpenseRequestDto request) {
        // 영수증 이미지 업로드
        String receiptImageUrl = null;
        if (file != null && !file.isEmpty()) {
            try {
                receiptImageUrl = receiptService.uploadFile(file, "receipt");
            } catch (Exception e) {
                log.error("Receipt upload failed", e);
                throw new CustomException(ErrorCode.FILE_UPLOAD_FAIL);
            }
        }

        PaymentInfoDto info = request.paymentInfo();

        // Expense 저장 (paidAt은 paymentInfo에서)
        Expense expense = Expense.builder()
                .groupId(groupId)
                .createdByUserId(userId)
                .totalAmount(info != null ? info.totalAmount() : request.amount())
                .merchantName(request.displayName())
                .memo(request.memo())
                .paidAt(info != null ? info.paidAt() : null)
                .receiptUrl(receiptImageUrl)
                .build();
        expenseRepository.save(expense);
        expense.startSettlement();

        // Receipt 저장
        if (info != null) {
            Receipt receipt = Receipt.builder()
                    .expenseId(expense.getId())
                    .merchantName(info.merchantName())
                    .address(info.address())
                    .paidAt(info.paidAt())
                    .totalAmount(info.totalAmount())
                    .businessNumber(info.businessNumber())
                    .build();
            receiptRepository.save(receipt);

            // ReceiptItem + ReceiptItemOption 저장
            if (info.items() != null) {
                for (CreateExpenseRequestDto.ItemDto itemDto : info.items()) {
                    ReceiptItem item = ReceiptItem.builder()
                            .receipt(receipt)
                            .name(itemDto.name())
                            .unitPrice(itemDto.unitPrice())
                            .quantity(itemDto.quantity())
                            .amount(itemDto.amount())
                            .build();
                    receipt.getItems().add(item);

                    if (itemDto.options() != null) {
                        for (CreateExpenseRequestDto.OptionDto optionDto : itemDto.options()) {
                            ReceiptItemOption option = ReceiptItemOption.builder()
                                    .receiptItem(item)
                                    .name(optionDto.name())
                                    .unitPrice(optionDto.unitPrice())
                                    .quantity(optionDto.quantity())
                                    .amount(optionDto.amount())
                                    .build();
                            item.getOptions().add(option);
                        }
                    }
                }
                receiptRepository.save(receipt);
            }
        }

        // Charge 저장
        BigDecimal totalChargeAmount = request.amount().multiply(BigDecimal.valueOf(request.participants().size()));

        Charge charge = Charge.builder()
                .groupId(groupId)
                .expenseId(expense.getId())
                .createdByUserId(userId)
                .displayName(request.displayName())
                .totalAmount(totalChargeAmount)
                .chargeType(ChargeType.SETTLEMENT)
                .receiverAccountNumber(request.receiverAccountNumber())
                .receiverBankCode(BankCode.codeOf(request.receiverBankName()))
                .receiverBankName(request.receiverBankName())
                .build();
        chargeRepository.save(charge);

        // ChargeTarget 저장
        List<ChargeTarget> targets = request.participants().stream()
                .map(participantUserId -> ChargeTarget.builder()
                        .charge(charge)
                        .userId(participantUserId)
                        .amount(request.amount())
                        .build())
                .toList();
        chargeTargetRepository.saveAll(targets);

        return ExpenseResponseDto.of(expense, charge, targets, receiptImageUrl, request);
    }

    @Transactional(readOnly = true)
    public SettlementDetailResponseDto getSettlementDetail(Long groupId, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new CustomException(ErrorCode.BAD_REQUEST));

        if (!expense.getGroupId().equals(groupId)) {
            throw new CustomException(ErrorCode.BAD_REQUEST);
        }

        Charge charge = chargeRepository.findByExpenseId(expenseId)
                .orElseThrow(() -> new CustomException(ErrorCode.BAD_REQUEST));

        List<ChargeTarget> targets = chargeTargetRepository.findByCharge_IdAndIsDeletedFalse(charge.getId());

        Receipt receipt = receiptRepository.findByExpenseIdWithItems(expenseId).orElse(null);

        return SettlementDetailResponseDto.of(expense, targets, receipt);
    }

    @Transactional(readOnly = true)
    public SettlementDefaultersResponseDto getSettlementDefaulters(Long groupId, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new CustomException(ErrorCode.BAD_REQUEST));

        if (!expense.getGroupId().equals(groupId)) {
            throw new CustomException(ErrorCode.BAD_REQUEST);
        }

        Charge charge = chargeRepository.findByExpenseId(expenseId)
                .orElseThrow(() -> new CustomException(ErrorCode.BAD_REQUEST));

        List<ChargeTarget> targets = chargeTargetRepository.findByCharge_IdAndIsDeletedFalse(charge.getId());

        return SettlementDefaultersResponseDto.of(targets);
    }
}
