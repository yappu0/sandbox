class PaymentsController < ApplicationController
  def create
    payment_intent = Stripe::PaymentIntent.create({
                                                    amount: 500,
                                                    currency: 'jpy',
                                                    # ダッシュボードで決済手段を管理する、最新のAPIはデフォルトでtrueになっている
                                                    automatic_payment_methods: {
                                                      enabled: true,
                                                    },
                                                  })
    render json: { clientSecret: payment_intent.client_secret }
  end
end
