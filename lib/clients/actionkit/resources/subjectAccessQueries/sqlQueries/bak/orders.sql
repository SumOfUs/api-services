SELECT c_order.*, transaction.*, recurring.* FROM ak_sumofus.core_order c_order
  JOIN ak_sumofus.core_user user ON c_order.user_id = user.id
  LEFT JOIN ak_sumofus.core_transaction transaction ON transaction.order_id = c_order.id
  LEFT JOIN ak_sumofus.core_orderrecurring recurring ON recurring.order_id = c_order.id
  WHERE user.email= ?
