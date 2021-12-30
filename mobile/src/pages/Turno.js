import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions
} from 'react-native';
import { Button, LinearProgress, Tab, TabView } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient'

import { getTurnosActivosPromise } from './promises';
import StylesGlobal from './StylesGlobal';

const {width, height} = Dimensions.get('window');
const metrics = {
    screenWidth: width < height ? width : height,
    screenHeight: width < height ? height : width,
};

const styles = StyleSheet.create({
    primaryButton: {
        position: 'absolute',
        right: 5,
    },
    linearGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        height: 200,
        width: 350,
    },
    button: {
        alignSelf: "flex-start",
    },
})

export default class Turno extends Component {
    state = {
        turnos: null,
        turno: null,
        tabIndex: 0
    }

    async componentDidMount() {
        
    }

    changeTabIndex(index) {
        this.setState({
            tabIndex: index
        })
    }

    render() {
        const { currentUser, turno, closeTurno } = this.props
        const { tabIndex } = this.state

        return (
            <View style={{padding:10, height: metrics.screenHeight-58}}>
                <Button
                    buttonStyle={{padding:0, width:30, height:30, backgroundColor:"transparent", marginBottom:10}}
                    style={{color:"#000"}}
                    onPress={closeTurno}
                    icon={{
                        name: "arrow-back-ios",
                        color: StylesGlobal.colorBlue
                    }}
                />
                <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                    <View style={{ ...styles.button, width: '85%'}}>
                        <Text style={{fontSize: 30, color: StylesGlobal.colorBlue, fontWeight:'500'}}>
                            {turno.molino.name}
                        </Text>
                        <Text style={{fontSize: 25, color: StylesGlobal.colorBlue, fontWeight:'400'}}>
                            Cliente: {turno.molino.faena.client.name}
                        </Text>
                    </View>
                    <View style={{ ...styles.button, width: '15%'}}>
                        <View style={{width:62, height:62, 
                                backgroundColor: 'rgba(0,176,240,.8)', 
                                borderRadius: 31, 
                                paddingTop:12
                                }}>
                            <Text style={{textAlign:'center', fontSize:20, lineHeight: 20, fontWeight: '500', color: 'white'}}>{turno.molino.hours}</Text>
                            <Text style={{textAlign:'center', fontSize:18, lineHeight: 18, fontWeight: '400', color: 'white'}}>horas</Text>
                        </View>
                    </View>
                </View>
                <LinearProgress variant="determinate" 
                        style={{ marginTop: 10, height: 24, borderRadius: 12, padding:4, paddingLeft: 8, paddingRight: 8 }} 
                        color={StylesGlobal.colorBlue}
                        value={turno.molino.percentage}
                />
                <View
                    style={{
                        borderBottomColor: StylesGlobal.colorBlue,
                        borderBottomWidth: 1,
                        marginTop: 20,
                        marginBottom: 20
                    }}
                />
                <Tab value={tabIndex} onChange={this.changeTabIndex.bind(this)}
                    indicatorStyle={{
                        backgroundColor: StylesGlobal.colorBlue,
                        height: 2,
                      }}
                      >
                    <Tab.Item title="Detalle" containerStyle={{backgroundColor:'transparent', color: StylesGlobal.colorBlue}}>
                    </Tab.Item>
                    <Tab.Item title="Equipo" containerStyle={{backgroundColor:'transparent', color: StylesGlobal.colorBlue}}>
                    </Tab.Item>
                </Tab>

                <TabView value={tabIndex} >
                    <TabView.Item style={{ width: '100%', marginTop: 10}}>
                        <Text style={{fontSize:20}}>Recent111</Text>
                    </TabView.Item>
                    <TabView.Item style={{ width: '100%', marginTop: 10}}>
                        <Text style={{fontSize:20}}>Recent222</Text>
                    </TabView.Item>
                </TabView>
            </View>
        )
    }
}