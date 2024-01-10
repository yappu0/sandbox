Rails.application.routes.draw do
  devise_for :users

  resources :articles
  resources :payments, only: [:create]
  resources :webhooks, only: [:create]

  root "articles#index"
end
