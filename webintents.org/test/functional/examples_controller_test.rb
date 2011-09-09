require 'test_helper'

class ExamplesControllerTest < ActionController::TestCase
  test "should get pick_pick" do
    get :pick_pick
    assert_response :success
  end

  test "should get pick_action" do
    get :pick_action
    assert_response :success
  end

  test "should get pick_register" do
    get :pick_register
    assert_response :success
  end

end
