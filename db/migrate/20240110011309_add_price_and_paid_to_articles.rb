class AddPriceAndPaidToArticles < ActiveRecord::Migration[7.0]
  def change
    add_column :articles, :price, :integer
    add_column :articles, :paid, :boolean
  end
end
