require 'test_helper'

class MemegenControllerTest < ActionController::TestCase
  test "should get show" do
    get :show
    assert_response :success
  end

  test "should get proxy" do
    get :proxy
    assert_response :success
  end

end
