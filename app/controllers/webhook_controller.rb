class WebhookController < ApplicationController
  def create
    endpoint_secret = Rails.application.credentials.stripe[:webhook_secret]
    payload = request.body.read
    sig_header = request.env['HTTP_STRIPE_SIGNATURE']
    event = nil

    begin
      event = Stripe::Webhook.construct_event(
        payload, sig_header, endpoint_secret
      )
    rescue JSON::ParserError => e
      # Invalid payload
      status 400
      return
    rescue Stripe::SignatureVerificationError => e
      # Invalid signature
      status 400
      return
    end

    # Handle the event
    case event.type
    when 'payment_intent.succeeded'
      payment_intent = event.data.object
      # ... handle other event types
      p payment_intent
      Purchase.create(user: current_user, article_id: 1)
    else
      puts "Unhandled event type: #{event.type}"
    end

    status 200
  end
end
