// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import * as bootstrap from "bootstrap"

console.log("Hello from application.js")

document.addEventListener('turbo:load', () => {
// Stripe実装
  const stripe = Stripe('pk_test_51O1n06Fako1LsI9nA7Gk8hyMJrdSQp3ein0myF12YAvUgSmEeNa2ffdtxlEnIprbuJ89qHAssN5d9hRTf2SKUXzU00gTAl9dqk')

// The items the customer wants to buy
  const articleId = document.getElementById("article-id").dataset.id
  const items = [{ id: `article-${articleId}` }]

  let elements;

  initialize();
  checkStatus();

  document.querySelector("#payment-form").addEventListener("submit", handleSubmit);

// 決済ページが読み込まれたらすぐに、サーバーのエンドポイントにリクエストを行い、新しい PaymentIntent を作成します。
// 支払いは、エンドポイントから返された clientSecret を使用して完了します。
  async function initialize() {
    // PaymentIntent を取得する
    const response = await fetch("/payments", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector("[name='csrf-token']").getAttribute('content')
      },
      body: JSON.stringify({ items }),
    });
    const { clientSecret } = await response.json();

    // Stripe Elements を初期化する
    const appearance = {
      theme: 'stripe',
    };
    elements = stripe.elements({ appearance, clientSecret });

    // PaymentElement を作成する
    const paymentElementOptions = {
      layout: "tabs",
    };
    const paymentElement = elements.create("payment", paymentElementOptions);
    paymentElement.mount("#payment-element");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: "http://localhost:3000",
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      showMessage(error.message);
    } else {
      showMessage("An unexpected error occurred.");
    }

    setLoading(false);
  }

// Fetches the payment intent status after payment submission
  async function checkStatus() {
    const clientSecret = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

    switch (paymentIntent.status) {
      case "succeeded":
        showMessage("Payment succeeded!");
        break;
      case "processing":
        showMessage("Your payment is processing.");
        break;
      case "requires_payment_method":
        showMessage("Your payment was not successful, please try again.");
        break;
      default:
        showMessage("Something went wrong.");
        break;
    }
  }

// ------- UI helpers -------

  function showMessage(messageText) {
    const messageContainer = document.querySelector("#payment-message");

    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;

    setTimeout(function () {
      messageContainer.classList.add("hidden");
      messageContainer.textContent = "";
    }, 4000);
  }

// Show a spinner on payment submission
  function setLoading(isLoading) {
    if (isLoading) {
      // Disable the button and show a spinner
      document.querySelector("#submit").disabled = true;
      document.querySelector("#spinner").classList.remove("hidden");
      document.querySelector("#button-text").classList.add("hidden");
    } else {
      document.querySelector("#submit").disabled = false;
      document.querySelector("#spinner").classList.add("hidden");
      document.querySelector("#button-text").classList.remove("hidden");
    }
  }
})
