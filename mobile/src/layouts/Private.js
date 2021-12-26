import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text
} from 'react-native';
import { Header, Button, ListItem, Icon, Image } from 'react-native-elements';

import apiConfig from '../config/api';

const {width, height} = Dimensions.get('window');
const metrics = {
    screenWidth: width < height ? width : height,
    screenHeight: width < height ? height : width,
};

const styles = StyleSheet.create({
    scroll: {
        backgroundColor: '#E1D7D8',
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
                        {/*}
                        <Image 
                            style={styles.tinyLogo}
                            source={{
                            uri: apiConfig.url + '/getImageClient?clientId=' + currentUser.client.id+"&amp;r=2",
                            }}
                            resizeMode="contain"
                            />
                        */}
                    }
                    centerComponent={{ text: 'MILMA', style: { color: '#fff' } }}
                    rightComponent={
                        <Button
                            buttonStyle={{padding:0}}
                            onPress={logoutHandler}
                            icon={{
                                name: "logout",
                                color: "white"
                            }}
                        />
                    }
                />
                { menu === null ?
                    <View>
                        <ListItem key="item1" bottomDivider
                            onPress={() => this.clickMenu('menu1')}
                        >
                            <Icon name="build" />
                            <ListItem.Content>
                                <ListItem.Title>Mantenimiento1</ListItem.Title>
                            </ListItem.Content>
                            <ListItem.Chevron />
                        </ListItem>
                        <ListItem key="item2" bottomDivider
                            onPress={() => this.clickMenu('menu2')}
                        >
                            <Icon name="build" />
                            <ListItem.Content>
                                <ListItem.Title>Mantenimiento2</ListItem.Title>
                            </ListItem.Content>
                            <ListItem.Chevron />
                        </ListItem>
                    </View>
                    :
                    <View style={{flexGrow:1, padding: 5}} textAlign="flex-start">
                        <Button
                            buttonStyle={{padding:0, width:30, height:30, backgroundColor:"transparent", marginBottom:10}}
                            style={{color:"#000"}}
                            onPress={this.returnMenu.bind(this)}
                            icon={{
                                name: "arrow-back-ios",
                                color: "black"
                            }}
                        />
                        <Text>{menu}</Text>
                    </View>
                }
            </View>
        )
    }
}