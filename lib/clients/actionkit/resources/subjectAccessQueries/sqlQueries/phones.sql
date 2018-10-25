SELECT phone.* FROM ak_sumofus.core_phone phone
JOIN ak_sumofus.core_user user ON user.id = phone.user_id
WHERE email=?
