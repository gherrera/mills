import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions
} from 'react-native';
import { Button, LinearProgress, Tab, TabView } from 'react-native-elements';
import * as Progress from 'react-native-progress';

import StylesGlobal from './StylesGlobal';

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
    col: {
        alignSelf: "flex-start",
    },
    footer: {
        bottom: 0,
        width: Dimensions.get('window').width,
        position: 'absolute',
        height: 60,
        textAlign: 'center',
        borderTopColor: StylesGlobal.colorGray,
        borderTopWidth: 2,
        padding: 10,
        alignItems: 'center'
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
            <View style={{padding:10, height: Dimensions.get('window').height-60}}>
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
                    <View style={{ ...styles.col, width: '85%'}}>
                        <Text style={{fontSize: 30, color: StylesGlobal.colorBlue, fontWeight:'400'}}>
                            {turno.molino.name} - {turno.molino.type}
                        </Text>
                        <Text style={{fontSize: 25, color: StylesGlobal.colorBlue, fontWeight:'400'}}>
                            Cliente: {turno.molino.faena.client.name}
                        </Text>
                    </View>
                    <View style={{ ...styles.col, width: '15%'}}>
                        <View style={{width:62, height:62, 
                                backgroundColor: 'rgba(0,176,240,.8)', 
                                borderRadius: 31, 
                                paddingTop:12
                                }}>
                            <Text style={{textAlign:'center', fontSize:20, lineHeight: 20, fontWeight: '500', color: 'white'}}>{turno.molino.hours}</Text>
                            <Text style={{textAlign:'center', fontSize:18, lineHeight: 18, fontWeight: '400', color: 'white'}}>horas</Text>
                        </View>
                    </View>
                    <View style={{ ...styles.col, width: '32%', marginTop: 10}}>
                        <Text style={{fontSize: 50, color: StylesGlobal.colorBlue, fontWeight:'400'}}>
                            {turno.molino.montadas}
                            <View style={{width: 110, paddingLeft:10}}>
                                <Text style={{fontSize: 20, color: StylesGlobal.colorBlue, lineHeight:23, top:10}}>
                                    Pienzas montadas
                                </Text>
                            </View>
                        </Text>
                    </View>
                    <View style={{ ...styles.col, width: '28%', marginTop: 10}}>
                        <Text style={{fontSize: 50, color: StylesGlobal.colorBlue, fontWeight:'400'}}>
                            {turno.molino.giros}
                            <View style={{width: 110, paddingLeft:10}}>
                                <Text style={{fontSize: 20, color: StylesGlobal.colorBlue, lineHeight:23, top:-10}}>
                                    Giros
                                </Text>
                            </View>
                        </Text>
                    </View>
                    <View style={{ ...styles.col, width: '40%', marginTop:20}}>
                        <Progress.Bar 
                            progress={turno.molino.percentage} 
                            height={40} 
                            width={(Dimensions.get('window').width-20)*0.4} 
                            borderRadius={20}
                            color={StylesGlobal.colorBlue}
                            borderWidth={2}
                        />
                        <Text style={{width:60, top:6, right:15, textAlign:'right', position:'absolute', color:StylesGlobal.colorGray, fontSize: 22}}>
                            {Math.round(turno.molino.percentage*100)}%
                        </Text>
                    </View>
                </View>
                
                <View
                    style={{
                        borderBottomColor: StylesGlobal.colorSkyBlue,
                        borderBottomWidth: 1,
                        marginTop: 20,
                        marginBottom: 10
                    }}
                />
                <Tab value={tabIndex} onChange={this.changeTabIndex.bind(this)}
                    indicatorStyle={{
                        backgroundColor: StylesGlobal.colorSkyBlue,
                        height: 2,
                      }}
                    //variant="primary"
                >
                    <Tab.Item title="Detalle" containerStyle={{backgroundColor:'transparent', color: StylesGlobal.colorBlue}}>
                    </Tab.Item>
                    <Tab.Item title="Equipo" containerStyle={{backgroundColor:'transparent', color: StylesGlobal.colorBlue}}>
                    </Tab.Item>
                </Tab>

                <TabView value={tabIndex}>
                    <TabView.Item style={{ width: Dimensions.get('window').width-20, marginTop: 20, height: Dimensions.get('window').height-60}}>
                        <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                            <View style={{ ...styles.col, width: '40%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>Proyecto</Text>
                            </View>
                            <View style={{ ...styles.col, width: '60%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>{turno.molino.name}</Text>
                            </View>

                            <View style={{ ...styles.col, width: '40%', padding:5}}>
                                <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>Faena</Text>
                            </View>
                            <View style={{ ...styles.col, width: '60%', padding:5}}>
                                <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>{turno.molino.faena.name}</Text>
                            </View>

                            <View style={{ ...styles.col, width: '40%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>Equipo</Text>
                            </View>
                            <View style={{ ...styles.col, width: '60%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>{turno.molino.type}</Text>
                            </View>

                            <View style={{ ...styles.col, width: '40%', padding:5}}>
                                <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>Piezas</Text>
                            </View>
                            <View style={{ ...styles.col, width: '60%', padding:5}}>
                                <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>{turno.molino.piezas}</Text>
                            </View>
                        </View>
                    </TabView.Item>
                    <TabView.Item style={{width: Dimensions.get('window').width-20, marginTop: 20}} onMoveShouldSetResponder={(e) => e.stopPropagation()}>
                        <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                            <View style={{ ...styles.col, width: '40%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>Turno</Text>
                            </View>
                            <View style={{ ...styles.col, width: '60%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>{turno.name}</Text>
                            </View>

                            <View style={{ ...styles.col, width: '40%', padding:5}}>
                                <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>Responsable</Text>
                            </View>
                            <View style={{ ...styles.col, width: '60%', padding:5}}>
                                <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>{currentUser.name}</Text>
                            </View>

                            <View style={{ ...styles.col, width: '40%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>Personal</Text>
                            </View>
                            <View style={{ ...styles.col, width: '60%', padding:5, flexDirection: "row", flexWrap: "wrap"}}>
                            {turno.personas.map((persona,index) => 
                                <>
                                    <View style={{ ...styles.col, width: '50%', padding:5, backgroundColor: (index%2===0?StylesGlobal.colorSkyBlue10:null)}}>
                                        <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>{persona.name}</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '50%', padding:5, backgroundColor: (index%2===0?StylesGlobal.colorSkyBlue10:null)}}>
                                        <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>{persona.role}</Text>
                                    </View>
                                </>
                            )}
                            {turno.personas.map((persona,index) => 
                                <>
                                    <View style={{ ...styles.col, width: '50%', padding:5, backgroundColor: (index%2===0?StylesGlobal.colorSkyBlue10:null)}}>
                                        <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>{persona.name}</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '50%', padding:5, backgroundColor: (index%2===0?StylesGlobal.colorSkyBlue10:null)}}>
                                        <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>{persona.role}</Text>
                                    </View>
                                </>
                            )}
                            {turno.personas.map((persona,index) => 
                                <>
                                    <View style={{ ...styles.col, width: '50%', padding:5, backgroundColor: (index%2===0?StylesGlobal.colorSkyBlue10:null)}}>
                                        <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>{persona.name}</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '50%', padding:5, backgroundColor: (index%2===0?StylesGlobal.colorSkyBlue10:null)}}>
                                        <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>{persona.role}</Text>
                                    </View>
                                </>
                            )}
                            {turno.personas.map((persona,index) => 
                                <>
                                    <View style={{ ...styles.col, width: '50%', padding:5, backgroundColor: (index%2===0?StylesGlobal.colorSkyBlue10:null)}}>
                                        <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>{persona.name}</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '50%', padding:5, backgroundColor: (index%2===0?StylesGlobal.colorSkyBlue10:null)}}>
                                        <Text style={{fontSize:22, color: StylesGlobal.colorBlue}}>{persona.role}</Text>
                                    </View>
                                </>
                            )}
                            </View>
                            
                        </View>
                    </TabView.Item>
                </TabView>

                <View style={styles.footer}>
                    <View>
                        <Button 
                            title={turno.status !== 'OPEN' ? "Inicio del Turno" : "Ingresar"}
                            buttonStyle={{width:200, height:40}}
                            titleStyle={{fontSize: 20, lineHeight: 22}}
                        />
                    </View>
                </View>
            </View>
        )
    }
}