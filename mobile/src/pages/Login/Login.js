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
import { Button, Image } from 'react-native-elements';

import { getAuthTokenPromise } from '../../promises';
import { authTokenSessionStorageSaverHelper } from '../../helpers';
import apiConfig from '../../config/api';

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
            }
            this.setState({ isLoading: false })
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
                    style={{color: '#A9562F', fontSize: 30, width:200, textAlign: 'center', paddingBottom: 20, fontWeight: "600"}}>
                        Operational Software
                </Text>
              </Container>
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
                                color: 'black'
                            }}
                            buttonStyle={{
                                backgroundColor:'orange'
                            }}
                            onPress={this.loginClick.bind(this)} />
                </View>
          </View>
      );
    }
}