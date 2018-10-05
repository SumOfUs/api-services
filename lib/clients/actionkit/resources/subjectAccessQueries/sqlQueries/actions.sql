SELECT * FROM ak_sumofus.core_action action
  JOIN ak_sumofus.core_user ON action.user_id = ak_sumofus.core_user.id
  LEFT JOIN ak_sumofus.core_actionfield actionfield ON actionfield.parent_id = action.id
  WHERE ak_sumofus.core_user.email = ?
