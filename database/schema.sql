-- LeafAI · MySQL schema
CREATE DATABASE IF NOT EXISTS leafai
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE leafai;

CREATE TABLE IF NOT EXISTS predictions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  image_url    VARCHAR(1024)   NOT NULL,
  heatmap_url  VARCHAR(1024)   NOT NULL,
  disease      VARCHAR(128)    NOT NULL,
  confidence   DECIMAL(5,4)    NOT NULL,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_created_at (created_at),
  INDEX idx_disease    (disease)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
