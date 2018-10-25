SELECT open.* FROM ak_sumofus.core_open open
JOIN ak_sumofus.core_user user ON user.id = open.user_id
WHERE email=?
