SELECT location.* FROM ak_sumofus.core_location location
JOIN ak_sumofus.core_user user ON user.id = location.user_id
WHERE user.email=?
