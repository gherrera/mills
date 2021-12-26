import React, { Component } from 'react';
 
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
 
import Spinner from 'react-native-loading-spinner-overlay';

import Container from '../../components/Container';
import Label  from '../../components/Label';
import { Button } from 'react-native-elements';

import { getAuthTokenPromise } from '../../promises';
import { authTokenSessionStorageSaverHelper } from '../../helpers';

const {width, height} = Dimensions.get('window');
const metrics = {
    screenWidth: width < height ? width : height,
    screenHeight: width < height ? height : width,
};

const styles = StyleSheet.create({
    scroll: {
        backgroundColor: '#E1D7D8',
        padding: 30,
        height: metrics.screenHeight
    },
    label: {
        color: '#0d8898',
        fontSize: 20
    },
    alignRight: {
        alignSelf: 'flex-end'
    },
    textInput: {
        height: 42,
        fontSize: 18,
        backgroundColor: '#FFF',
        color: 'black',
    },
    buttonWhiteText: {
        fontSize: 20,
        color: '#FFF',
    },
    buttonBlackText: {
        fontSize: 20,
        color: '#595856'
    },
    primaryButton: {
        height:40,
        backgroundColor: '#34A853'
    },
    footer: {
       marginTop: 100
    },
    container: {
        flex: 1,
        justifyContent: "center"
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    }
});

export default class Login extends Component {
    state = {
        username: '',
        password: '',
        isLoading: false
    }

    async loginClick() {

        //await this.validateFields(['username', 'password'])
        this.setState({ isLoading: true })
        const { username, password } = this.state
        if(username && username !== '' && password && password !== '') {
            const authToken = await getAuthTokenPromise(username, password)
            if (!authToken.error) {
                await authTokenSessionStorageSaverHelper(authToken)
                const { successHandler } = this.props
                await successHandler()
            }else {
                this.setState({ isLoading: false })
            }
        }else {
            Alert.alert('Login', 'Debe ingresar usuario y clave');
            this.setState({ isLoading: false })
        }
    }

    render() {
      const { isLoading } = this.state
      
      return (
          <View style={styles.scroll} >
              { isLoading && 
                <Spinner
                    visible={true}
                />
              }
              <Container>
                    <Label text="Usuario" />
                    <TextInput
                        style={styles.textInput}
                        value={this.state.username}
                        onChangeText={(username) => this.setState({ username })}
                    />
              </Container>
              <Container>
                    <Label text="Clave" />
                    <TextInput
                        secureTextEntry={true}
                        style={styles.textInput}
                        value={this.state.password}
                        onChangeText={(password) => this.setState({ password })}
                    />
              </Container>
              <View style={styles.footer}>
                        <Button 
                            title="Entrar"
                            titleStyle={{
                                fontSize: 20,
                            }}
                            onPress={this.loginClick.bind(this)} />
                </View>
          </View>
      );
    }
}