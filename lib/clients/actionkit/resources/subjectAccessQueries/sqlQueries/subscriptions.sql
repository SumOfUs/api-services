SELECT subs.*, list.name FROM ak_sumofus.core_subscription subs
JOIN ak_sumofus.core_user user ON user.id = subs.user_id
JOIN ak_sumofus.core_list list ON subs.list_id = list.id
WHERE email=?
