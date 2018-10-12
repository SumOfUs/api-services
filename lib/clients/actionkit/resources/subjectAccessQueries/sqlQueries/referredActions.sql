SELECT * FROM ak_sumofus.core_action action
  JOIN ak_sumofus.core_user ON action.referring_user_id = ak_sumofus.core_user.id
  WHERE ak_sumofus.core_user.email=?
