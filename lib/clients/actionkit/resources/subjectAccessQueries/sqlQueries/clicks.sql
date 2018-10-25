SELECT click.* FROM ak_sumofus.core_click click
JOIN ak_sumofus.core_user user ON user.id = click.user_id
WHERE email=?
