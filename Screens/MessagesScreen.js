import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Picker,
  TouchableHighlight,
  Button,
  Alert,
  CheckBox
} from "react-native";
import { Dropdown } from "react-native-material-dropdown";
import DatePicker from "react-native-datepicker";
import AsyncStorage from "@react-native-community/async-storage";
import { GiftedChat } from "react-native-gifted-chat";
import SocketIOClient from "socket.io-client";
import AppConf from "../app.json";

export default class MessagesScreen extends React.Component {
  state = {
    messages: [],
    users: [],
    message: "",
    usuarioAtual: "",
    user_id: 0,
    selectedDate: new Date(),
    selectedUser: "",
    selectedOrder: "",
    all: true,
    order: [
      { label: "Mais antigas", value: "1" },
      { label: "Mais novas", value: "-1" }
    ],
    modalVisible: false
  };

  constructor(props) {
    super(props);

    this.socket = SocketIOClient(AppConf.hostname);
    this.socket.emit("connection");

    this.socket.on("new-message", data => {
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, data)
      }));
    });

    this.socket.on("remove-message", data => {
      let id = data._id;
      fetch(AppConf.hostname + "/messages")
        .then(response => response.json())
        .then(responseJson => {
          this.setState({
            messages: responseJson
          });
          Alert.alert(
            "Alerta",
            "Mensagem removida",
            [{}, {}, { text: "OK", onPress: () => console.log("OK Pressed") }],
            { cancelable: false }
          );
        })
        .catch(error => {
          console.log(error);
        });
    });
  }

  GetMessages = () => {
    fetch(AppConf.hostname + "/messages")
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          messages: responseJson
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  async componentDidMount() {
    var usuarioAtual = await AsyncStorage.getItem("usuario");
    var id = await AsyncStorage.getItem("id");

    this.setState({
      usuarioAtual: usuarioAtual,
      user_id: id
    });

    this.GetMessages();

    fetch(AppConf.hostname + "/users")
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          users: responseJson
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  onSend(messages = []) {
    var message = {
      text: this.state.message,
      createdAt: new Date(),
      user: {
        _id: this.state.user_id,
        name: this.state.usuarioAtual
      }
    };

    fetch(AppConf.hostname + "/new/message", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    })
      .then(response => {
        response.json();
      })
      .then(response => {
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, messages)
        }));
      })
      .catch(error => {
        console.log(error);
      });
  }

  setCustomText = e => {
    this.setState(() => ({
      message: e
    }));
  };

  toggleModal = e => {
    this.setState(() => ({
      modalVisible: !this.state.modalVisible
    }));
  };

  applyFilters = () => {
    try {
      if (!this.state.all) {
        fetch(AppConf.hostname + "/messages/" + this.state.selectedOrder, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            filter: {
              user: { _id: this.state.selectedUser },
              date: this.state.selectedDate
            }
          })
        })
          .then(response => {
            return response.json();
          })
          .then(responseJson => {
            this.setState(previousState => ({
              messages: responseJson,
              modalVisible: false
            }));
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        this.GetMessages();
        this.setState(previousState => ({
          modalVisible: false
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  removeMessage = msg => {
    fetch(AppConf.hostname + "/delete/message", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: msg._id
      })
    });
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
        >
          <View style={{ marginTop: 22, padding: 15 }}>
            <Dropdown
              label="Usuários"
              value={this.state.selectedUser}
              onChangeText={value => {
                this.setState({ selectedUser: value });
              }}
              data={this.state.users}
              valueExtractor={({ _id }) => _id}
              labelExtractor={({ username }) => username}
            />

            <Dropdown
              label="Ordem"
              value={this.state.selectedOrder}
              onChangeText={value => {
                this.setState({ selectedOrder: value });
              }}
              data={this.state.order}
              valueExtractor={({ value }) => value}
              labelExtractor={({ label }) => label}
            />

            <Text style={{ fontSize: 19 }}>Data</Text>
            <DatePicker
              style={{ width: "100%" }}
              date={this.state.selectedDate}
              mode="date"
              placeholder="select date"
              format="YYYY-MM-DD"
              confirmBtnText="OK"
              cancelBtnText="Cancelar"
              customStyles={{
                dateIcon: {
                  position: "absolute",
                  left: 0,
                  top: 4,
                  marginLeft: 0
                },
                dateInput: {
                  marginLeft: 36
                }
              }}
              onDateChange={date => {
                this.setState({ selectedDate: date });
              }}
            />

            <Text style={{ fontSize: 19 }}>Todas(Igorar filtros)</Text>
            <CheckBox
              label="Todas(Igorar filtros)"
              value={this.state.all}
              onValueChange={value => this.setState({ all: !this.state.all })}
            />
          </View>

          <View style={styles.bottom}>
            <Button
              title="Buscar"
              onPress={() => {
                this.applyFilters();
              }}
            />
          </View>
          <View style={styles.top}>
            <Button
              title="Fechar"
              onPress={() => {
                this.toggleModal();
              }}
            />
          </View>
        </Modal>

        <GiftedChat
          renderLoading={() => (
            <ActivityIndicator size="large" color="#0000ff" />
          )}
          placeholder="Insira uma mensagem!"
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          renderUsernameOnMessage={true}
          onLongPress={(ctx, currentMessage) => {
            this.removeMessage(currentMessage);
          }}
          onInputTextChanged={text => this.setCustomText(text)}
          user={{
            _id: this.state.user_id,
            name: this.state.usuarioAtual
          }}
          text={this.state.message}
        />
        <Button title="Filtros" onPress={() => this.toggleModal()} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    width: "100%",
    position: "absolute",
    bottom: 0
  },

  top: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: 0,
    right: 0
  }
});
