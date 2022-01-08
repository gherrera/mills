import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    Alert,
    ScrollView,
    BackHandler,
    Modal,
    TextInput
} from 'react-native';
import { Button, Tab, TabView } from 'react-native-elements';
import * as Progress from 'react-native-progress';

import { inicioTurnoPromise, finTurnoPromise, getTurnoPromise, startInterruptionPromise, finishInterruptionPromise } from './promises';
import { FasePage } from '.';

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
        bottom: -51,
        width: Dimensions.get('window').width,
        position: 'absolute',
        height: 60,
        textAlign: 'center',
        borderTopColor: StylesGlobal.colorGray,
        borderTopWidth: 2,
        padding: 10,
        alignItems: 'center',
    },
})

export default class Turno extends Component {
    state = {
        turnos: null,
        turno: this.props.turno,
        tabIndex: 0,
        isVisibleInterruption: false,
        comments: null,
        isLoadingInterruption: false
    }

    constructor(props) {
        super(props)
        this.backAction = this.backActionHandler.bind(this);
    }

    init() {
        getTurnoPromise(this.props.turno.id).then(t => {
            this.setState({
                turno: t
            })
            if(t.molino.currentStage.hasInterruption) {
                this.setState({
                    isVisibleInterruption: true
                })
            }
        })
    }

    componentDidMount() {
        this.init()
        if(this.props.turno.return === true) {
            console.log('activa retorno')
            BackHandler.addEventListener(
                "hardwareBackPress",
                this.backAction
            );
        }
    }

    componentWillUnmount() {
        //console.log('componentWillUnmount')
        BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    }

    backActionHandler = () => {
        console.log('boton volver')
        const { turno } = this.state
        if(turno.open === true) {
            this.init()
        }else {
            this.props.returnMenu()
        }
        return true;
    }

    changeTabIndex(index) {
        this.setState({
            tabIndex: index
        })
    }

    handleInicioTurnoClick() {
        const { turno, isVisibleInterruption } = this.state
        if(turno.status !== 'OPEN') {
            Alert.alert(
                "Inicio de Turno",
                "Confirma el Inicio del Turno: " +turno.name+ "?",
                [
                  {
                    text: "Cancelar",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                  },
                  { text: "Iniciar Turno", onPress: () => {
                        inicioTurnoPromise(turno.id).then(r => {
                            r.open = true
                            this.setState({
                                turno: r
                            })
                        })
                    }
                  }
                ]
            );
        }else {
            turno.open = true
            this.setState({
                turno: turno
            })
        }
    }

    finTurno() {
        const { turno } = this.state
        finTurnoPromise(turno.id).then(r => {
            this.setState({
                turno: r
            })
        })
    }

    handleInterrupcionClick() {
        this.setState({
            isVisibleInterruption: true
        })
    }

    handleCloseInterruption() {
        this.setState({
            isVisibleInterruption: false
        })
    }

    handleStartInterruption() {
        const { turno, comments } = this.state
        this.setState({isLoadingInterruption:true})
        startInterruptionPromise(turno.id, comments).then(t => {
            t.open = true
            this.setState({
                turno: t,
                comments: null,
                isLoadingInterruption: false
            })
        })
    }

    handleFinishInterruption() {
        const { turno } = this.state
        this.setState({isLoadingInterruption:true})
        finishInterruptionPromise(turno.id).then(t => {
            t.open = true
            this.setState({
                turno: t,
                isVisibleInterruption: false,
                isLoadingInterruption: false
            })
        })
    }

    handleFinTurnoClick() {
        const { turno } = this.state
        Alert.alert(
            "Fin de Turno",
            "Confirma el Fin del Turno: " +turno.name+ "?",
            [
            {
                text: "Cancelar",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
            },
            { text: "Finalizar Turno", onPress: () => {
                    this.finTurno()
                }
            }
            ]
        );
    }

    returnMenuFase() {
        this.init()
    }

    render() {
        const { currentUser } = this.props
        const { tabIndex, turno, isVisibleInterruption, isLoadingInterruption } = this.state
        const {t, i18n} = this.props.screenProps; 

        return (
            <View style={{padding:10, height: Dimensions.get('window').height-110}}>
                { isVisibleInterruption &&
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={true}
                    >
                        <View style={{
                            backgroundColor: 'rgba(255,255,255,.97)', 
                            width:'85%', 
                            height:400, 
                            alignSelf:'center', 
                            marginTop: Dimensions.get('window').height*0.2, 
                            borderRadius:15, 
                            padding:12,
                            borderColor:StylesGlobal.colorBlue50, 
                            borderWidth:5}}>
                            <Text style={{fontSize:26, padding:10, textAlign:'center', color: StylesGlobal.colorBlue}}>
                                Interrupcion
                            </Text>
                            <Text style={{fontSize:24, padding:10, textAlign:'center', color: StylesGlobal.colorBlue}}>
                                { turno.molino.currentStage.hasInterruption ?
                                    "Interrupción en curso"
                                    :
                                    "Iniciar una Interrupción"
                                }
                            </Text>
                            { turno.molino.currentStage.hasInterruption ?
                                <>
                                    <TextInput
                                        placeholder="Motivo de la interrupción"
                                        multiline={true}
                                        numberOfLines={3}
                                        editable={false}
                                        value={
                                            turno.molino.currentStage.events && turno.molino.currentStage.events.filter(e => e.type === 'INTERRUPTION' && e.finishDate === null)[0].comments
                                        }
                                        style={{borderColor:StylesGlobal.colorGray, borderWidth:1, borderRadius:5, padding: 5, textAlignVertical: 'top', marginBottom:30}}
                                    />
                                    <Button
                                        title="Terminar"
                                        titleStyle={{fontSize:20, textAlign:'center'}}
                                        loading={isLoadingInterruption}
                                        buttonStyle={{width:'70%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10, borderColor: StylesGlobal.colorSkyBlue, borderWidth:2, marginTop:30 }}
                                        onPress={this.handleFinishInterruption.bind(this)}
                                    />
                                </>
                                :
                                <>
                                    <TextInput
                                        placeholder="Motivo de la interrupción"
                                        multiline={true}
                                        numberOfLines={3}
                                        onChangeText={(val) => this.setState({ comments: val })}
                                        style={{borderColor:StylesGlobal.colorGray, borderWidth:1, borderRadius:5, padding: 5, textAlignVertical: 'top', marginBottom:30}}
                                    />
                                    <Button
                                        title="Iniciar interrupción"
                                        titleStyle={{fontSize:20, textAlign:'center'}}
                                        loading={isLoadingInterruption}
                                        buttonStyle={{width:'70%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10, borderColor: StylesGlobal.colorSkyBlue, borderWidth:2 }}
                                        onPress={this.handleStartInterruption.bind(this)}
                                    />
                                    <Button
                                        title="Salir"
                                        type="clear"
                                        titleStyle={{fontSize:20, textAlign:'center'}}
                                        buttonStyle={{width:'70%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10, borderColor: StylesGlobal.colorSkyBlue, borderWidth:2 }}
                                        onPress={this.handleCloseInterruption.bind(this)}
                                    />
                                </>
                            }
                        </View>
                    </Modal>
                }
                { turno.open === true ?
                    <FasePage currentUser={currentUser} turno={turno} finTurno={this.finTurno.bind(this)} returnMenu={this.returnMenuFase.bind(this)}  screenProps={this.props.screenProps}/>
                :
                <>
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
                        <View style={{ ...styles.col, width: '35%', marginTop: 10}}>
                            <Text style={{fontSize: 35, color: StylesGlobal.colorBlue, fontWeight:'400'}}>
                                {turno.molino.totalMontadas}
                            </Text>
                            <View style={{paddingLeft:45, width:'100%', position:'absolute'}}>
                                <Text style={{width:'100%', fontSize: 17, color: StylesGlobal.colorBlue, flexWrap:'nowrap'}}>
                                    Piezas
                                </Text>
                                <Text style={{width:'100%', fontSize: 17, color: StylesGlobal.colorBlue, flexWrap:'nowrap'}}>
                                    montadas
                                </Text>
                            </View>
                        </View>
                        <View style={{ ...styles.col, width: '25%', marginTop: 10}}>
                            <Text style={{fontSize: 35, color: StylesGlobal.colorBlue, fontWeight:'400'}}>
                                {turno.molino.giros}
                                <View style={{paddingLeft:10,}}>
                                    <Text style={{fontSize: 17, color: StylesGlobal.colorBlue, lineHeight:18, top:-7}}>
                                        Giros
                                    </Text>
                                </View>
                            </Text>
                        </View>
                        <View style={{ ...styles.col, width: '40%', marginTop:18}}>
                            <Progress.Bar 
                                progress={turno.molino.percentage} 
                                height={30} 
                                width={(Dimensions.get('window').width-20)*0.4} 
                                borderRadius={20}
                                color={StylesGlobal.colorBlue}
                                borderWidth={2}
                            />
                            <Text style={{width:60, top:3, right:15, textAlign:'right', position:'absolute', color:StylesGlobal.colorGray, fontSize: 20}}>
                                {Math.round(turno.molino.percentage*100)}%
                            </Text>
                        </View>
                    </View>
                    
                    <View
                        style={{
                            borderBottomColor: StylesGlobal.colorSkyBlue,
                            borderBottomWidth: 1,
                            marginTop: 15,
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
                    <ScrollView>
                        <TabView value={tabIndex}>
                            <TabView.Item style={{ width: Dimensions.get('window').width-20, marginTop: 20, height: Dimensions.get('window').height-60}}>
                                <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                                    <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlue}}>Proyecto</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlue}}>{turno.molino.name}</Text>
                                    </View>

                                    <View style={{ ...styles.col, width: '50%', padding:5}}>
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlue}}>Faena</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '50%', padding:5}}>
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlue}}>{turno.molino.faena.name}</Text>
                                    </View>

                                    <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlue}}>Equipo</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlue}}>{turno.molino.type}</Text>
                                    </View>

                                    <View style={{ ...styles.col, width: '50%', padding:5}}>
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlue}}>Piezas</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '50%', padding:5}}>
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlue}}>{turno.molino.piezas}</Text>
                                    </View>
                                </View>
                            </TabView.Item>

                            <TabView.Item style={{width: Dimensions.get('window').width-20, marginTop: 20}} onMoveShouldSetResponder={(e) => e.stopPropagation()}>
                                <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                                    <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlue}}>Turno</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlue}}>{turno.name}</Text>
                                    </View>

                                    <View style={{ ...styles.col, width: '50%', padding:5}}>
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlue}}>Responsable</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '50%', padding:5}}>
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlue}}>{currentUser.name}</Text>
                                    </View>

                                    <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlue}}>Personal</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorSkyBlue10, padding:5}}>
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlue}}> </Text>
                                    </View>
                                    {turno.personas && turno.personas.map((persona,index) => 
                                        <React.Fragment key={Math.random()}>
                                            <View style={{ ...styles.col, width: '50%', padding:5, backgroundColor: (index%2===1?StylesGlobal.colorSkyBlue10:null)}}>
                                                    <Text style={{fontSize:17, color: StylesGlobal.colorBlue}}>{persona.name}</Text>
                                            </View>
                                            <View style={{ ...styles.col, width: '50%', padding:5, backgroundColor: (index%2===1?StylesGlobal.colorSkyBlue10:null)}}>
                                                <Text style={{fontSize:17, color: StylesGlobal.colorBlue}}>{persona.role}</Text>
                                            </View>
                                        </React.Fragment>
                                    )}
                                </View>
                            </TabView.Item>
                        </TabView>
                    </ScrollView>
                </>
                }

                <View style={styles.footer}>
                    <View>
                        { turno.open !== true ?
                            <>
                                { (turno.molino.status !== 'FINISHED' || turno.status === 'OPEN') &&
                                    <Button 
                                        title={turno.status !== 'OPEN' ? "Inicio del Turno" : "Ingresar"}
                                        buttonStyle={{width:200, height:40, borderRadius: 10}}
                                        titleStyle={{fontSize: 20, lineHeight: 22}}
                                        onPress={this.handleInicioTurnoClick.bind(this)}
                                    />
                                }
                            </>
                            :
                            <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                                <View style={{ ...styles.col, width: '50%'}}>
                                    <Button 
                                        title={"Fin del Turno"}
                                        buttonStyle={{width:'85%', height:40, borderRadius: 10, alignSelf:'center'}}
                                        titleStyle={{fontSize: 18, lineHeight: 20}}
                                        onPress={this.handleFinTurnoClick.bind(this)}
                                    />
                                </View>
                                <View style={{ ...styles.col, width: '50%'}}>
                                    <Button 
                                        title={"Interrupción"}
                                        buttonStyle={{width:'85%', height:40, borderRadius: 10, alignSelf:'center'}}
                                        titleStyle={{fontSize: 18, lineHeight: 20}}
                                        onPress={this.handleInterrupcionClick.bind(this)}
                                    />
                                </View>
                            </View>
                        }
                    </View>
                </View>
            </View>
        )
    }
}