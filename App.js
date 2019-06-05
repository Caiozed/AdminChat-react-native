/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, { Component } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";

import LoginScreen from "./Screens/LoginScreen";
import MessagesScreen from "./Screens/MessagesScreen";
import { Provider } from "react-redux";

const MainNavigator = createStackNavigator(
  {
    Login: { screen: LoginScreen },
    Messages: { screen: MessagesScreen }
  },
  {
    initialRouteName: "Login",
    header: null,
    headerMode: "none"
  }
);

const Router = createAppContainer(MainNavigator);

export default class App extends Component {
  render() {
    return <Router />;
  }
}
