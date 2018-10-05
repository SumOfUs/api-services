SELECT userfield.* FROM ak_sumofus.core_userfield userfield
JOIN ak_sumofus.core_user user ON user.id = userfield.parent_id
WHERE email=?
