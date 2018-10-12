SELECT mailing.reply_to, mailing.html, mailing.scheduled_for FROM ak_sumofus.core_usermailing usermailing
JOIN ak_sumofus.core_user ON usermailing.user_id = ak_sumofus.core_user.id
JOIN ak_sumofus.core_mailing mailing ON usermailing.mailing_id = mailing.id
WHERE ak_sumofus.core_user.email=?
