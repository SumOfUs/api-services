SELECT page_tags.*, tag.name FROM ak_sumofus.core_user_page_tags page_tags
JOIN ak_sumofus.core_user user ON user.id = page_tags.user_id
JOIN ak_sumofus.core_tag tag ON tag.id = page_tags.tag_id
WHERE email=?
