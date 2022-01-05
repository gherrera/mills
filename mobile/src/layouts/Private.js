import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text
} from 'react-native';
import { Header, Button, ListItem, Icon, Image } from 'react-native-elements';
import { HomePage } from '../pages';

import StylesGlobal from '../pages/StylesGlobal';

const {width, height} = Dimensions.get('window');
const metrics = {
    screenWidth: width < height ? width : height,
    screenHeight: width < height ? height : width,
};

const styles = StyleSheet.create({
    scroll: {
        height: metrics.screenHeight,
    },
    primaryButton: {
        position: 'absolute',
        right: 5,
    },
    buttonWhiteText: {
        fontSize: 20,
        color: '#FFF',
        textAlign: 'center'
    },
    tinyLogo: {
        width: 50,
        height: 22,
        margin: 1
    },
    textUser: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Verdana',
    },
    box: {
        flexBasis: 55,
        borderWidth: 1,
        borderColor: 'black',
        height: 40,
      }
})

export default class Private extends Component {
    state = {
        menu: null
    }

    clickMenu(menu) {
        this.setState({
            menu: menu
        })
    }

    returnMenu() {
        this.setState({
            menu: null
        })
    }

    render() {
        const { children, currentUser, logoutHandler } = this.props
        const { menu } = this.state

        return (
            <View style={styles.scroll} >
                <Header
                    leftComponent={
                        { text: currentUser.login, style: { color: '#fff', top:3, fontSize:18 } }
                        /*
                        <Image 
                            style={styles.tinyLogo}
                            source={{
                            uri: apiConfig.url + '/getImageClient?clientId=' + currentUser.client.id+"&amp;r=2",
                            }}
                            resizeMode="contain"
                            />
                        */
                    }
                    centerComponent={{ text: 'MILL\'S', style: { color: '#fff', top:3, fontSize:17 } }}
                    rightComponent={
                        <Button
                            buttonStyle={{padding:0, top: 2}}
                            onPress={logoutHandler}
                            icon={{
                                name: "logout",
                                color: "white"
                            }}
                        />
                    }
                />
                <HomePage currentUser={currentUser} screenProps={this.props.screenProps}/>
            </View>
        )
    }
}