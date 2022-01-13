import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    StatusBar
} from 'react-native';
import { Header, Button } from 'react-native-elements';
import { HomePage } from '../pages';

import StylesGlobal from '../pages/StylesGlobal';
import apiConfig from '../config/api';


const {width, height} = Dimensions.get('window');
const metrics = {
    screenWidth: width < height ? width : height,
    screenHeight: width < height ? height : width,
};

const styles = StyleSheet.create({
    scroll: {
        height: metrics.screenHeight - (apiConfig.env === "dev" ? StatusBar.currentHeight : 0),
        //borderWidth:1,
        //borderColor:'red'
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
    },
    col: {
        alignSelf: "flex-start",
    },
    header: {
        height: 32,
        backgroundColor:'rgba(0,0,0,0.85)'
    }
})

export default class Private extends Component {
    state = {
        menu: null,
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
        const { currentUser, logoutHandler,  } = this.props

        return (
            <View style={styles.scroll} >
                <View style={{flexDirection: "row", flexWrap: "wrap", backgroundColor: styles.header.backgroundColor, height: styles.header.height}} textAlign="flex-start">
                    <View style={{ ...styles.col, width: '30%', paddingLeft:5}}>
                        <Text style={{ color: '#fff', top:2, fontSize: 16, padding: 2 }}>{currentUser.login}</Text>
                    </View>
                    <View style={{ ...styles.col, width: '40%'}}>
                        <Text style={{ color: '#fff', top:2, fontSize: 16, top: 4, textAlign: 'center' }}>MILL'S</Text>
                    </View>
                    <View style={{ ...styles.col, width: '30%', paddingRight: 5}}>
                        <Button
                            buttonStyle={{padding:2, top: 2, backgroundColor:'transparent', width:32, alignSelf:'flex-end'}}
                            onPress={logoutHandler}
                            icon={{
                                name: "logout",
                                color: "white",
                                size: 20
                            }}
                        />
                    </View>
                </View>
                <HomePage currentUser={currentUser} screenProps={this.props.screenProps} height={styles.scroll.height - styles.header.height}/>
            </View>
        )
    }
}