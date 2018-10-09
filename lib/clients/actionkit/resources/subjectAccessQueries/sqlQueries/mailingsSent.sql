SELECT mailing_sent.* FROM ak_sumofus.core_transactionalmailingsent mailing_sent
JOIN ak_sumofus.core_user user ON user.id = mailing_sent.user_id
WHERE user.email=?
