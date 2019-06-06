import React, { Component } from "react";
import {
  Button,
  StyleSheet,
  View,
  TextInput,
  Text,
  Image,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import AppConf from "../app.json";
export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = { username: "", password: "" };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  Login = () => {
    if (this.state.username.length > 0 && this.state.password.length > 0) {
      fetch(AppConf.hostname + "/admin/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password
        })
      })
        .then(response => response.json())
        .then(async responseJson => {
          if (responseJson.username == undefined) {
            this.ShowErrorMessage(responseJson);
          }

          const { navigate } = this.props.navigation;
          await AsyncStorage.setItem("usuario", responseJson.username);
          await AsyncStorage.setItem("id", responseJson._id);
          navigate("Messages");
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  Register = () => {
    if (this.state.username.length > 0 && this.state.password.length > 0) {
      fetch(AppConf.hostname + "/new/admin", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password
        })
      })
        .then(response => response.json())
        .then(async responseJson => {
          if (responseJson.username == undefined) {
            this.ShowErrorMessage(responseJson);
          }

          const { navigate } = this.props.navigation;
          await AsyncStorage.setItem("usuario", responseJson.username);
          await AsyncStorage.setItem("id", responseJson._id);

          navigate("Messages");
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  ShowErrorMessage(message) {
    Alert.alert(
      "Alerta",
      message,
      [{}, {}, { text: "OK", onPress: () => console.log("OK Pressed") }],
      { cancelable: false }
    );
  }

  handleInputChange(event = {}) {
    this.setState({ username: event });
  }

  handlePasswordChange(event = {}) {
    this.setState({ password: event });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Admin Chat!</Text>
          <Image style={styles.logo} source={require("./logo.png")} />
        </View>

        <View>
          <TextInput
            name="username"
            onChangeText={this.handleInputChange}
            value={this.state.username}
            style={styles.inputBox}
            placeholder="Nome de usuario"
          />
          <TextInput
            name="username"
            secureTextEntry={true}
            onChangeText={this.handlePasswordChange}
            value={this.state.password}
            style={styles.inputBox}
            placeholder="Senha de admin"
          />
        </View>

        <View style={styles.formContainer}>
          <View style={styles.button}>
            <Button title="Login" onPress={e => this.Login(e)} />
          </View>
          <View style={styles.button}>
            <Button title="Registrar" onPress={e => this.Register(e)} />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
    backgroundColor: "#435572"
  },
  button: {
    margin: 5
  },
  titleContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50
  },
  title: {
    textAlign: "center",
    color: "white",
    margin: 25,
    fontSize: 25
  },
  inputBox: {
    backgroundColor: "#F5FCFF",
    margin: 5,
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    color: "black"
  },
  logo: {
    width: 80,
    height: 80,
    margin: 5
  },
  formContainer: {
    flex: 1,
    margin: 25,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch"
  }
});
