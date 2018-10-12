SELECT subs.*, list.name, changetype.* FROM ak_sumofus.core_subscriptionhistory subs
JOIN ak_sumofus.core_user user ON user.id = subs.user_id
JOIN ak_sumofus.core_list list ON subs.list_id = list.id
JOIN ak_sumofus.core_subscriptionchangetype changetype ON changetype.id = subs.change_id
WHERE email=?
