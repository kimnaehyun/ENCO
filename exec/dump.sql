CREATE TABLE `transaction_histories` (
	`id`	BIGINT	NOT NULL,
	`account_id`	BIGINT	NOT NULL,
	`card_id`	BIGINT	NULL,
	`vote_id`	BIGINT	NOT NULL,
	`display_name`	VARCHAR(255)	NULL,
	`type`	ENUM('TRANSFER', 'WITHDRAWAL', 'CARD_PAYMENT')	NOT NULL,
	`category`	VARCHAR(255)	NULL	DEFAULT 'ETC'	COMMENT '회비, 음식, 여행, 문화, 그외',
	`direction`	ENUM('IN','OUT')	NOT NULL,
	`memo`	VARCHAR(255)	NULL,
	`amount`	DECIMAL(12,2)	NOT NULL,
	`balance`	DECIMAL(12,2)	NOT NULL,
	`receipt_url`	TEXT	NULL,
	`receipt_content`	TEXT	NULL,
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`counterparty_bank_code`	VARCHAR(10)	NULL	COMMENT '088, 001 등',
	`counterparty_bank_name`	VARCHAR(50)	NULL,
	`counterparty_bank_account_number`	VARCHAR(50)	NULL,
	`counterparty_name`	VARCHAR(50)	NULL,
	`status`	ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELED')	NOT NULL	DEFAULT 'PENDING'	COMMENT '대기,승인,거절,취소',
	`idempotency_key`	VARCHAR(64)	NULL	COMMENT 'UNIQUE'
);

CREATE TABLE `events` (
	`id`	BIGINT	NOT NULL,
	`event_name`	VARCHAR(100)	NOT NULL,
	`start_date`	DATE	NOT NULL,
	`end_date`	DATE	NOT NULL,
	`start_time`	TIME	NOT NULL,
	`end_time`	TIME	NOT NULL,
	`reward_point`	DECIMAL(10,2)	NOT NULL	DEFAULT 0	COMMENT '달성 시 지급할 포인트',
	`status`	ENUM('ACTIVE', 'CLOSED')	NOT NULL,
	`target_rate`	TINYINT	NOT NULL,
	`min_limit`	INT	NOT NULL	COMMENT '포인트 지급 최소 모임원 수',
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL,
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false
);

CREATE TABLE `types` (
	`id`	BIGINT	NOT NULL,
	`name`	varchar(20)	NOT NULL
);

CREATE TABLE `attendances` (
	`id`	BIGINT	NOT NULL,
	`user_id`	BIGINT	NOT NULL,
	`event_id`	BIGINT	NOT NULL,
	`attended_at`	DATETIME	NOT NULL,
	`streak_days`	BIGINT	NOT NULL	DEFAULT 0,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL,
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`group_id`	BIGINT	NOT NULL
);

CREATE TABLE `card_products` (
	`id`	BIGINT	NOT NULL,
	`name`	varchar(20)	NOT NULL,
	`base_spending`	DECIMAL(10,2)	NOT NULL	DEFAULT 0,
	`max_benefit_limit`	DECIMAL(10,2)	NOT NULL	DEFAULT 0,
	`description`	TEXT	NULL,
	`front_image_url`	TEXT	NULL,
	`back_image_url`	TEXT	NULL,
	`max_limit`	DECIMAL(15, 2)	NOT NULL	DEFAULT 0,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL,
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false
);

CREATE TABLE `cards` (
	`id`	BIGINT	NOT NULL,
	`account_id`	BIGINT	NOT NULL,
	`card_product_id`	BIGINT	NOT NULL,
	`card_number`	VARCHAR(50)	NOT NULL,
	`cvc`	VARCHAR(10)	NOT NULL,
	`type`	ENUM('CREDIT', 'CHECK')	NOT NULL	DEFAULT 'CHECK',
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL,
	`expiration_at`	DATETIME	NOT NULL,
	`is_basic`	BOOLEAN	NOT NULL
);

CREATE TABLE `users` (
	`id`	BIGINT	NOT NULL,
	`name`	VARCHAR(20)	NOT NULL,
	`email`	VARCHAR(50)	NOT NULL,
	`birth_day`	DATE	NOT NULL,
	`gender`	ENUM('W', 'M')	NOT NULL,
	`phone_number`	VARCHAR(50)	NOT NULL,
	`password`	VARCHAR(100)	NOT NULL,
	`pin_code`	VARCHAR(50)	NOT NULL,
	`profile_url`	INT	NULL,
	`address`	VARCHAR(200)	NULL,
	`role`	ENUM('USER', 'ADMIN')	NOT NULL	DEFAULT 'USER',
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL,
	`device_token`	VARCHAR(100)	NOT NULL
);

CREATE TABLE `accounts` (
	`id`	BIGINT	NOT NULL,
	`product_id`	BIGINT	NOT NULL,
	`group_id`	BIGINT	NULL,
	`account_number`	VARCHAR(100)	NOT NULL	COMMENT 'UNIQUE',
	`password`	VARCHAR(20)	NOT NULL,
	`amount`	DECIMAL(12,2)	NOT NULL	DEFAULT 0,
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL,
	`expiration_at`	DATETIME	NOT NULL,
	`last_transaction_at`	DATETIME	NULL,
	`currency`	VARCHAR(8)	NOT NULL	DEFAULT 'KRW',
	`account_type`	ENUM('GROUP', 'PERSONAL')	NOT NULL
);

CREATE TABLE `travel_products` (
	`id`	BIGINT	NOT NULL,
	`merchant_id`	BIGINT	NOT NULL,
	`name`	VARCHAR(100)	NOT NULL,
	`price`	DECIMAL(12,2)	NOT NULL,
	`quantity`	INT	NOT NULL,
	`description`	TEXT	NULL,
	`image_url`	VARCHAR(100)	NULL,
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL,
	`location`	VARCHAR(100)	NULL
);

CREATE TABLE `group_types` (
	`id`	BIGINT	NOT NULL,
	`group_id`	BIGINT	NOT NULL,
	`type_id`	BIGINT	NOT NULL
);

CREATE TABLE `due_policies` (
	`id`	BIGINT	NOT NULL,
	`group_id`	BIGINT	NOT NULL,
	`amount`	DECIMAL(12,2)	NOT NULL	DEFAULT 0,
	`start_date`	DATE	NOT NULL	COMMENT '다시 확인하기',
	`day_of_month`	INT	NULL	COMMENT '1~28일 단위 (~일마다 걷음)',
	`status`	ENUM('ACTIVE','PAUSED')	NOT NULL	DEFAULT 'ACTIVE',
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL
);

CREATE TABLE `receipts` (
	`id`	BIGINT	NOT NULL,
	`expense_id`	BIGINT	NULL,
	`transaction_id`	BIGINT	NULL,
	`merchant_name`	VARCHAR(255)	NULL,
	`address`	VARCHAR(500)	NULL,
	`paid_at`	DATETIME	NULL,
	`total_amount`	DECIMAL(12,2)	NULL,
	`business_number`	VARCHAR(20)	NULL,
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NULL,
	`updated_at`	DATETIME	NULL,
	`deleted_at`	DATETIME	NULL
);

CREATE TABLE `receipt_item_options` (
	`id`	BIGINT	NOT NULL,
	`receipt_item_id`	BIGINT	NOT NULL,
	`name`	VARCHAR(255)	NULL,
	`unit_price`	DECIMAL(12,2)	NULL,
	`quantity`	INT	NULL,
	`amount`	DECIMAL(12,2)	NULL
);

CREATE TABLE `group_users` (
	`id`	BIGINT	NOT NULL,
	`group_id`	BIGINT	NULL,
	`user_id`	BIGINT	NULL,
	`role`	ENUM('LEADER','TREASURER','USER')	NULL	DEFAULT 'USER',
	`status`	ENUM('ACTIVE','LEFT')	NULL	DEFAULT 'ACTIVE',
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL
);

CREATE TABLE `votes` (
	`id`	BIGINT	NOT NULL,
	`group_id`	BIGINT	NOT NULL,
	`title`	VARCHAR(50)	NOT NULL,
	`status`	ENUM('VOTING', 'APPROVED', 'REJECTED', 'CANCELED')	NOT NULL	DEFAULT 'VOTING'	COMMENT '투표중,승인,거절,취소',
	`description`	TEXT	NULL,
	`created_at`	DATETIME	NOT NULL,
	`expired_at`	DATETIME	NOT NULL	COMMENT '투표 마감 시간',
	`deleted_at`	DATETIME	NULL,
	`method`	ENUM('AUTO', 'PASSIVITY')	NOT NULL	COMMENT '자동/수동'
);

CREATE TABLE `group_invites` (
	`token`	VARCHAR(36)	NOT NULL,
	`group_id`	BIGINT	NOT NULL,
	`created_by_user_id`	BIGINT	NOT NULL,
	`expires_at`	DATETIME	NOT NULL,
	`created_at`	DATETIME	NULL
);

CREATE TABLE `merchants` (
	`id`	BIGINT	NOT NULL,
	`name`	VARCHAR(255)	NOT NULL,
	`latitude`	DECIMAL(10,7)	NOT NULL,
	`longitude`	DECIMAL(10,7)	NOT NULL,
	`category`	VARCHAR(50)	NULL,
	`address`	VARCHAR(100)	NULL,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`deleted_at`	DATETIME	NULL
);

CREATE TABLE `charge_targets` (
	`id`	BIGINT	NOT NULL,
	`charge_id`	BIGINT	NOT NULL,
	`user_id`	BIGINT	NOT NULL	COMMENT '고민 조금만',
	`amount`	DECIMAL(12,2)	NOT NULL	DEFAULT 0,
	`remaining_amount`	DECIMAL(12,2)	NOT NULL	DEFAULT 0,
	`status`	ENUM('UNPAID','PARTIAL','PAID')	NOT NULL	DEFAULT 'UNPAID',
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL
);

CREATE TABLE `expenses` (
	`id`	BIGINT	NOT NULL,
	`group_id`	BIGINT	NOT NULL,
	`created_by_user_id`	BIGINT	NULL,
	`total_amount`	DECIMAL(12,2)	NULL,
	`merchant_name`	VARCHAR(255)	NULL,
	`receipt_url`	TEXT	NULL,
	`receipt_content`	TEXT	NULL,
	`memo`	VARCHAR(255)	NULL,
	`paid_at`	DATETIME	NULL,
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NULL,
	`updated_at`	DATETIME	NULL,
	`deleted_at`	DATETIME	NULL,
	`status`	ENUM('PENDING','IN_PROGRESS','COMPLETED')	NOT NULL	DEFAULT 'PENDING'
);

CREATE TABLE `charges` (
	`id`	BIGINT	NOT NULL,
	`group_id`	BIGINT	NOT NULL,
	`policy_id`	BIGINT	NULL,
	`expense_id`	BIGINT	NULL,
	`display_name`	VARCHAR(255)	NULL	DEFAULT 정기회비,
	`due_date`	DATETIME	NULL,
	`created_by_user_id`	BIGINT	NOT NULL,
	`total_amount`	DECIMAL(12,2)	NOT NULL	DEFAULT 0,
	`charge_type`	ENUM('REGULAR_DUE','EXTRA_DUE','SETTLEMENT')	NOT NULL	DEFAULT 'REGULAR_DUE',
	`status`	ENUM('OPEN','CLOSED','CANCELED')	NOT NULL	DEFAULT 'OPEN',
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL,
	`receiver_account_id`	BIGINT	NULL	COMMENT '모임 계좌에 넣을 때',
	`receiver_account_number`	VARCHAR(20)	NULL	COMMENT '영수증 정산 때',
	`receiver_bank_code`	VARCHAR(50)	NULL	COMMENT '영수증 정산 때',
	`receiver_bank_name`	VARCHAR(50)	NULL	COMMENT '영수증 정산 때'
);

CREATE TABLE `products` (
	`id`	BIGINT	NOT NULL,
	`product_name`	VARCHAR(100)	NULL	COMMENT '088, 001 등',
	`base_interest_rate`	DECIMAL(5, 2)	NOT NULL	DEFAULT 0.10,
	`description`	TEXT	NULL,
	`product_type`	ENUM('CHECKING', 'SAVINGS')	NOT NULL	DEFAULT 'CHECKING',
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL
);

CREATE TABLE `user_prepayments` (
	`id`	BIGINT	NOT NULL,
	`user_id`	BIGINT	NOT NULL,
	`group_id`	BIGINT	NOT NULL,
	`balance`	DECIMAL(12,2)	NOT NULL,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL
);

CREATE TABLE `card_benefits` (
	`id`	BIGINT	NOT NULL,
	`card_product_id`	BIGINT	NOT NULL,
	`category_id`	BIGINT	NOT NULL,
	`discount_rate`	DECIMAL(15,2)	NOT NULL	DEFAULT 0
);

CREATE TABLE `categories` (
	`id`	BIGINT	NOT NULL,
	`name`	VARCHAR(20)	NOT NULL
);

CREATE TABLE `receipt_items` (
	`id`	BIGINT	NOT NULL,
	`receipt_id`	BIGINT	NOT NULL,
	`name`	VARCHAR(255)	NULL,
	`unit_price`	DECIMAL(12,2)	NULL,
	`quantity`	INT	NULL,
	`amount`	DECIMAL(12,2)	NULL
);

CREATE TABLE `groups` (
	`id`	BIGINT	NOT NULL,
	`name`	VARCHAR(255)	NULL,
	`owner_user_id`	BIGINT	NOT NULL,
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL,
	`introduction`	VARCHAR(1000)	NULL,
	`vote_criteria`	INT	NULL	DEFAULT 0	COMMENT '0~100',
	`ground_rule`	VARCHAR(1000)	NULL,
	`point`	DECIMAL(12,2)	NOT NULL	DEFAULT 0,
	`account_id`	BIGINT	NULL
);

CREATE TABLE `orders` (
	`id`	BIGINT	NOT NULL,
	`travel_product_id`	BIGINT	NOT NULL,
	`total_amount`	DECIMAL(12,2)	NOT NULL	DEFAULT 0,
	`buyer_id`	BIGINT	NOT NULL,
	`total_count`	INT	NOT NULL,
	`status`	ENUM('WAITING', 'COMPLETED', 'CANCELED')	NOT NULL	COMMENT '대기/완료/취소',
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL,
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false
);

CREATE TABLE `vote_histories` (
	`id`	BIGINT	NOT NULL,
	`vote_id`	BIGINT	NOT NULL,
	`user_id`	BIGINT	NOT NULL,
	`status`	ENUM('APPROVE', 'REJECT')	NOT NULL	COMMENT '찬성, 반대',
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL
);

CREATE TABLE `point_histories` (
	`id`	BIGINT	NOT NULL,
	`group_id`	BIGINT	NOT NULL,
	`event_id`	BIGINT	NULL,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`amount`	DECIMAL(12,2)	NOT NULL	DEFAULT 0,
	`blance`	DECIMAL(12,2)	NOT NULL	DEFAULT 0,
	`direction`	ENUM('IN', 'OUT')	NOT NULL,
	`description`	VARCHAR(50)	NULL,
	`reference_id`	BIGINT	NOT NULL
);

CREATE TABLE `due_payments` (
	`id`	BIGINT	NOT NULL,
	`payer_user_id`	BIGINT	NULL,
	`group_id`	BIGINT	NULL,
	`charge_target_id`	BIGINT	NOT NULL,
	`amount`	DECIMAL(12,2)	NOT NULL	DEFAULT 0,
	`paid_at`	DATETIME	NULL,
	`memo`	VARCHAR(255)	NULL,
	`idempotency_key`	VARCHAR(64)	NOT NULL	COMMENT 'UNIQUE(중복 요청 파악)',
	`status`	ENUM('CREATED','SUCCESS','CANCELED')	NULL	DEFAULT 'CREATED',
	`is_deleted`	BOOLEAN	NOT NULL	DEFAULT false,
	`created_at`	DATETIME	NOT NULL,
	`updated_at`	DATETIME	NOT NULL,
	`deleted_at`	DATETIME	NULL
);