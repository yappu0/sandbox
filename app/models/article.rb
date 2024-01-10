class Article < ApplicationRecord
  def paid_content?
    price.present? && price > 0
  end
end
