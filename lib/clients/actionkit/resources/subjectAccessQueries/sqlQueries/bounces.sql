SELECT bounce.*  FROM ak_sumofus.core_bounce bounce
JOIN ak_sumofus.core_user user ON user.id = bounce.user_id
WHERE email= ?
