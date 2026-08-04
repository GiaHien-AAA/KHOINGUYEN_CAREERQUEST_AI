import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

@ccclass('LoginController')
export class LoginController extends Component {

    start() {
        console.log("Login Scene Loaded");
    }

    onStartButtonClick() {
        console.log("Start Button Clicked");
    }
}