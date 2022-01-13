import React, { Component } from 'react';
 
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Dimensions,
  StatusBar
} from 'react-native';
 
import Spinner from 'react-native-loading-spinner-overlay';

import Container from '../components/Container';
import { Button, Image, Input } from 'react-native-elements';

import { getAuthTokenPromise, forgotPwdPromise, getCurrentUserPromise } from '../promises';
import { authTokenSessionStorageSaverHelper } from '../helpers';
import apiConfig from '../config/api';

const {width, height} = Dimensions.get('window');
const metrics = {
    screenWidth: width < height ? width : height,
    screenHeight: width < height ? height : width,
};

const styles = StyleSheet.create({
    scroll: {
        backgroundColor: 'rgba(0,0,0,.9)',
        padding: 30,
        height: metrics.screenHeight
    },
    textInput: {
        height: 42,
        fontSize: 18,
        backgroundColor: '#FFF',
        color: 'black',
        borderRadius: 3
    },
    footer: {
       marginTop: 30
    },
    logo: {
        width: 200,
        height: 100,
        margin: 1,
        alignContent: 'center'
    },
    logoText: {
        width: 200,
        height: 50,
        margin: 1,
        alignContent: 'center'
    },
});

export default class Login extends Component {
    state = {
        username: '',
        password: '',
        isLoading: false,
        isForgotPwd: false
    }

    async loginClick() {

        //await this.validateFields(['username', 'password'])
        this.setState({ isLoading: true })
        const { username, password } = this.state
        if(username && username !== '' && password && password !== '') {
            const authToken = await getAuthTokenPromise(username, password)
            if (!authToken.error) {
                await authTokenSessionStorageSaverHelper(authToken)
                const currentU = await getCurrentUserPromise()
                if (currentU) {
                    if (currentU.type !== 'CONTROLLER') {
                        Alert.alert('Login', 'Usuario no permitido');
                        this.setState({ isLoading: false })
                    }else {
                        const { successHandler } = this.props
                        await successHandler(currentU)
                    }
                }else {
                    Alert.error('Login', 'Ocurrrio un error');
                    this.setState({ isLoading: false })
                }
            }else {
                this.setState({ isLoading: false })
            }
        }else {
            Alert.alert('Login', 'Debe ingresar usuario y clave');
            this.setState({ isLoading: false })
        }
    }

    async forgotPassword() {
        this.setState({ isForgotPwd: true })
    }

    async resendPwd() {
        this.setState({ isLoading: true })
        const { username } = this.state
        if(username && username !== '') {
            const fp = await forgotPwdPromise(username)
            if(fp) {
                Alert.alert('Login', 'Se envió una nueva clave');
            }else {
                Alert.alert('Login', 'Uuario no existe');
            }
        }else {
            Alert.alert('Login', 'Debe ingresar usuario');
        }
        this.setState({ isLoading: false, isForgotPwd: false })
    }

    async exitForgotPassword() {
        this.setState({ isForgotPwd: false })
    }

    render() {
      const { isLoading, isForgotPwd } = this.state
      
      return (
          <View style={styles.scroll} >
              { isLoading && 
                <Spinner
                    visible={true}
                />
              }
              <Container styles={{alignItems: 'center'}}>
                <Image
                    style={styles.logo}
                    source={{
                        uri: apiConfig.url + '/../images/logo.png',
                    }}
                    resizeMode="contain"
                />
                <Image
                    style={styles.logoText}
                    source={{
                        uri: apiConfig.url + '/../images/mills.png',
                    }}
                    resizeMode="contain"
                />
                <Text 
                    style={{color: '#A9572F', fontSize: 30, width:350, textAlign: 'center', padding: 20, fontWeight: "600"}}>
                        Operational Software
                </Text>
              </Container>
              <Container>
                    <Input
                        placeholder="Usuario"
                        leftIcon={{ type: 'ant-design', name: 'user', color:'white' }}
                        style={styles.textInput}
                        value={this.state.username}
                        onChangeText={(username) => this.setState({ username })}
                    />
              </Container>
              { !isForgotPwd &&
                <Container>
                        <Input
                            placeholder="Contraseña"
                            leftIcon={{ type: 'ant-design', name: 'key', color: 'white' }}
                            secureTextEntry={true}
                            style={styles.textInput}
                            value={this.state.password}
                            onChangeText={(password) => this.setState({ password })}
                        />
                </Container>
              }
              <View style={styles.footer}>
                <Container>
                { isForgotPwd ?
                    <>
                        <Button 
                            title="Enviar Contraseña"
                            titleStyle={{
                                fontSize: 20,
                                color: 'black'
                            }}
                            buttonStyle={{
                                backgroundColor:'#f79c39'
                            }}
                            onPress={this.resendPwd.bind(this)} />
                        <Button 
                            title="Volver"
                            titleStyle={{
                                fontSize: 18,
                                color: 'white'
                            }}
                            buttonStyle={{
                                backgroundColor:'transparent'
                            }}
                            onPress={this.exitForgotPassword.bind(this)} />
                    </>
                    :
                    <Button 
                        title="Entrar"
                        titleStyle={{
                            fontSize: 20,
                            color: 'black'
                        }}
                        buttonStyle={{
                            backgroundColor:'#f79c39'
                        }}
                        onPress={this.loginClick.bind(this)} />
                }                
                { !isForgotPwd &&
                    <Button 
                        title="Reestablecer Contraseña"
                        titleStyle={{
                            fontSize: 18,
                            color: 'white'
                        }}
                        buttonStyle={{
                            backgroundColor:'transparent'
                        }}
                        onPress={this.forgotPassword.bind(this)} />
                }
                </Container>
              </View>
          </View>
      );
    }
}