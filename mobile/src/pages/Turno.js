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
    TextInput,
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
        width: Dimensions.get('window').width,
        //top: Dimensions.get('window').height-60,
        bottom: 0,
        position: 'absolute',
        height: 64,
        textAlign: 'center',
        borderTopColor: StylesGlobal.colorGray,
        //borderTopColor: 'blue',
        borderTopWidth: 2,
        padding: 10,
        alignItems: 'center',
        //backgroundColor: StylesGlobal.colorYellow25
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

    setTurno(t) {
        t.return = this.props.turno.return
        t.molino.activeStage = t.molino.stages.length - 1
        this.setState({
            turno: t
        })
    }

    init() {
        const { turno } = this.state
        getTurnoPromise(turno.id).then(t => {
            this.setTurno(t)
            if(t.molino.currentStage && t.molino.currentStage.hasInterruption) {
                this.setState({
                    isVisibleInterruption: true
                })
            }
        })
    }

    componentDidMount() {
        this.init()
        BackHandler.addEventListener(
            "hardwareBackPress",
            this.backActionHandler
        );
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backActionHandler);
    }

    backActionHandler = () => {
        const { turno } = this.state
        if(turno.open === true) {
            this.init()
        }else if(turno.return) {
            this.props.returnMenu()
        }else {
            return false;
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
                            this.setTurno(r)
                        })
                    }
                  }
                ]
            );
        }else {
            turno.open = true
            this.setTurno(turno)
        }
    }

    finTurno() {
        const { turno } = this.state
        finTurnoPromise(turno.id).then(r => {
            this.setTurno(r)
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
            this.setTurno(t)
            this.setState({
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
            this.setTurno(t)
            this.setState({
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

    getTurnoDesc(turno) {
        if(turno === 'DAY') return 'Día'
        else if(turno === 'NIGHT') return 'Noche'
    }

    getRoleDesc(role) {
        if(role === 'CONTROLLER') return 'Controlador'
        else return role
    }

    render() {
        const { currentUser } = this.props
        const { tabIndex, turno, isVisibleInterruption, isLoadingInterruption } = this.state
        const {t, i18n} = this.props.screenProps; 

        return (
            <View style={{height: this.props.height}}>
                { isVisibleInterruption &&
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={true}
                    >
                        <View style={{
                            backgroundColor: 'rgba(255,255,255,.98)', 
                            width:'85%', 
                            height:400, 
                            alignSelf:'center', 
                            marginTop: Dimensions.get('window').height*0.2, 
                            borderRadius:15, 
                            padding:12,
                            borderColor:StylesGlobal.colorGray, 
                            borderWidth:3}}>
                            <Text style={{fontSize:26, padding:10, textAlign:'center', color: StylesGlobal.colorBlack90}}>
                                Interrupcion
                            </Text>
                            <Text style={{fontSize:24, padding:10, textAlign:'center', color: StylesGlobal.colorBlack90}}>
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
                                        buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'70%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10, marginTop:30 }}
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
                                        buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'70%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10, borderColor: StylesGlobal.colorGray, borderWidth:2 }}
                                        onPress={this.handleStartInterruption.bind(this)}
                                    />
                                    <Button
                                        title="Salir"
                                        type="clear"
                                        titleStyle={{fontSize:20, textAlign:'center', color: 'rgba(0,0,0,0.9)'}}
                                        buttonStyle={{width:'70%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10, borderColor: StylesGlobal.colorGray, borderWidth:2 }}
                                        onPress={this.handleCloseInterruption.bind(this)}
                                    />
                                </>
                            }
                        </View>
                    </Modal>
                }
                <View style={{padding:5, height: this.props.height-styles.footer.height+5}}>
                    { turno.open === true ?
                        <FasePage key={Math.random()} currentUser={currentUser} turno={turno} finTurno={this.finTurno.bind(this)} returnMenu={this.returnMenuFase.bind(this)}  screenProps={this.props.screenProps} />
                    :
                    <>
                        <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                            <View style={{ ...styles.col, width: '85%'}}>
                                <Text style={{fontSize: 25, color: StylesGlobal.colorBlack90, fontWeight:'400'}}>
                                    {turno.molino.name} - {turno.molino.type}
                                </Text>
                                <Text style={{fontSize: 22, color: StylesGlobal.colorBlack90, fontWeight:'400'}}>
                                    {turno.molino.faena.client.name}
                                </Text>
                            </View>
                            <View style={{ ...styles.col, width: '15%'}}>
                                <View style={{width:60, height:60, 
                                        backgroundColor: StylesGlobal.colorYellow, 
                                        borderRadius: 30, 
                                        paddingTop:11,
                                        alignSelf:'flex-end',
                                        borderWidth: 1,
                                        borderColor: StylesGlobal.colorBlack90,
                                        }}>
                                    <Text style={{textAlign:'center', fontSize:20, lineHeight: 20, fontWeight: '500', color: StylesGlobal.colorBlack90}}>{turno.molino.hours}</Text>
                                    <Text style={{textAlign:'center', fontSize:18, lineHeight: 18, fontWeight: '400', color: StylesGlobal.colorBlack90}}>horas</Text>
                                </View>
                            </View>
                            <View style={{ ...styles.col, width: '35%', marginTop: 10}}>
                                <Text style={{fontSize: 35, color: StylesGlobal.colorBlack90, fontWeight:'400', textAlign:'right', width:44, flexWrap:'nowrap'}}>
                                    {turno.molino.totalMontadas}
                                </Text>
                                <View style={{left:47, width:'100%', position:'absolute', top:5}}>
                                    <Text style={{width:'100%', fontSize: 17, color: StylesGlobal.colorBlack75, flexWrap:'nowrap'}}>
                                        Piezas
                                    </Text>
                                    <Text style={{width:'100%', fontSize: 17, lineHeight:16, color: StylesGlobal.colorBlack75, flexWrap:'nowrap'}}>
                                        montadas
                                    </Text>
                                </View>
                            </View>
                            <View style={{ ...styles.col, width: '25%', marginTop: 10}}>
                                <Text style={{fontSize: 35, color: StylesGlobal.colorBlack90, fontWeight:'400', textAlign:'right', width:40}}>
                                    {turno.molino.giros}
                                </Text>
                                <View style={{left:45, position:'absolute', top:20}}>
                                    <Text style={{fontSize: 17, color: StylesGlobal.colorBlack75, lineHeight:18, top:-7}}>
                                        Giros
                                    </Text>
                                </View>
                            </View>
                            <View style={{ ...styles.col, width: '40%', marginTop:18}}>
                                <Progress.Bar 
                                    progress={turno.molino.percentage} 
                                    height={30} 
                                    width={(Dimensions.get('window').width-40)*0.4} 
                                    borderRadius={10}
                                    color={StylesGlobal.colorGray50}
                                    borderWidth={1}
                                    borderColor="rgba(0,0,0,0.9)"
                                    alignSelf="center"
                                />
                                <Text style={{width:60, top:2, right:15, textAlign:'right', position:'absolute', color: 'rgba(0,0,0,0.9)', fontSize: 20}}>
                                    {Math.round(turno.molino.percentage*100)}%
                                </Text>
                            </View>
                        </View>
                        
                        <View
                            style={{
                                borderBottomColor: StylesGlobal.colorBlack,
                                borderBottomWidth: 1,
                                marginTop: 15,
                                marginBottom: 10
                            }}
                        />
                        <Tab value={tabIndex} onChange={this.changeTabIndex.bind(this)}
                            indicatorStyle={{
                                backgroundColor: StylesGlobal.colorBlack75,
                                height: 2,
                            }}
                            //variant="primary"
                        >
                            <Tab.Item title="Detalle" containerStyle={{backgroundColor:'transparent', padding:0, margin:0}} titleStyle={{color: StylesGlobal.colorBlack75}} >
                            </Tab.Item>
                            <Tab.Item title="Equipo" containerStyle={{backgroundColor:'transparent', padding:0, margin:0}} titleStyle={{color: StylesGlobal.colorBlack75}}>
                            </Tab.Item>
                        </Tab>
                        <ScrollView>
                            <TabView value={tabIndex}>
                                <TabView.Item style={{ width: Dimensions.get('window').width-20, marginTop: 10}}>
                                    <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                                        <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorGray10, padding:5}}>
                                            <Text style={{fontSize:20, color: StylesGlobal.colorBlack90}}>Proyecto</Text>
                                        </View>
                                        <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorGray10, padding:5}}>
                                            <Text style={{fontSize:20, color: StylesGlobal.colorBlack90}}>{turno.molino.name}</Text>
                                        </View>

                                        <View style={{ ...styles.col, width: '50%', padding:5}}>
                                            <Text style={{fontSize:20, color: StylesGlobal.colorBlack90}}>Faena</Text>
                                        </View>
                                        <View style={{ ...styles.col, width: '50%', padding:5}}>
                                            <Text style={{fontSize:20, color: StylesGlobal.colorBlack90}}>{turno.molino.faena.name}</Text>
                                        </View>

                                        <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorGray10, padding:5}}>
                                            <Text style={{fontSize:20, color: StylesGlobal.colorBlack90}}>Equipo</Text>
                                        </View>
                                        <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorGray10, padding:5}}>
                                            <Text style={{fontSize:20, color: StylesGlobal.colorBlack90}}>{turno.molino.type}</Text>
                                        </View>

                                        <View style={{ ...styles.col, width: '50%', padding:5}}>
                                            <Text style={{fontSize:20, color: StylesGlobal.colorBlack90}}>Piezas</Text>
                                        </View>
                                        <View style={{ ...styles.col, width: '50%', padding:5}}>
                                            <Text style={{fontSize:20, color: StylesGlobal.colorBlack90}}>{turno.molino.piezas}</Text>
                                        </View>
                                    </View>
                                </TabView.Item>

                                <TabView.Item style={{width: Dimensions.get('window').width-20, marginTop: 10}}>
                                    <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                                        <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorGray10, padding:5}}>
                                            <Text style={{fontSize:20, color: StylesGlobal.colorBlack90}}>Turno</Text>
                                        </View>
                                        <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorGray10, padding:5}}>
                                            <Text style={{fontSize:20, color: StylesGlobal.colorBlack90}}>{this.getTurnoDesc(turno.name)}</Text>
                                        </View>

                                        <View style={{ ...styles.col, width: '50%', padding:5}}>
                                            <Text style={{fontSize:20, color: StylesGlobal.colorBlack90}}>Responsable</Text>
                                        </View>
                                        <View style={{ ...styles.col, width: '50%', padding:5}}>
                                            <Text style={{fontSize:20, color: StylesGlobal.colorBlack90}}>{turno.molino.createUser}</Text>
                                        </View>

                                        <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorGray10, padding:5}}>
                                            <Text style={{fontSize:20, color: StylesGlobal.colorBlack90}}>Personal</Text>
                                        </View>
                                        <View style={{ ...styles.col, width: '50%', backgroundColor:StylesGlobal.colorGray10, padding:5}}>
                                            <Text style={{fontSize:20, color: StylesGlobal.colorBlack90}}> </Text>
                                        </View>
                                        {turno.personas && turno.personas.map((persona,index) => 
                                            <React.Fragment key={Math.random()}>
                                                <View style={{ ...styles.col, width: '50%', padding:5, backgroundColor: (index%2===1?StylesGlobal.colorGray10:null)}}>
                                                        <Text style={{fontSize:17, color: StylesGlobal.colorBlack90}}>{persona.name}</Text>
                                                </View>
                                                <View style={{ ...styles.col, width: '50%', padding:5, backgroundColor: (index%2===1?StylesGlobal.colorGray10:null)}}>
                                                    <Text style={{fontSize:17, color: StylesGlobal.colorBlack90}}>{this.getRoleDesc(persona.role)}</Text>
                                                </View>
                                            </React.Fragment>
                                        )}
                                    </View>
                                </TabView.Item>
                            </TabView>
                        </ScrollView>
                    </>
                    }
                </View>
                <View style={styles.footer}>
                    <View>
                        { turno.open !== true ?
                            <>
                                { (turno.molino.status !== 'FINISHED' || turno.status === 'OPEN') &&
                                    <Button 
                                        title={turno.status !== 'OPEN' ? "Inicio del Turno" : "Ingresar"}
                                        buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:200, height:40, borderRadius: 10}}
                                        titleStyle={{fontSize: 20, lineHeight: 22}}
                                        onPress={this.handleInicioTurnoClick.bind(this)}
                                    />
                                }
                            </>
                            :  turno.molino.stage !== 'DELIVERY' ?
                                <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                                    <View style={{ ...styles.col, width: '50%'}}>
                                        <Button 
                                            title={"Fin del Turno"}
                                            buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'85%', height:40, borderRadius: 10, alignSelf:'center'}}
                                            titleStyle={{fontSize: 18, lineHeight: 20}}
                                            onPress={this.handleFinTurnoClick.bind(this)}
                                        />
                                    </View>
                                    <View style={{ ...styles.col, width: '50%'}}>
                                        <Button 
                                            title={"Interrupción"}
                                            buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'85%', height:40, borderRadius: 10, alignSelf:'center'}}
                                            titleStyle={{fontSize: 18, lineHeight: 20}}
                                            onPress={this.handleInterrupcionClick.bind(this)}
                                        />
                                    </View>
                                </View>
                            :
                                <View style={{ ...styles.col, width: '100%'}}>
                                    <Button 
                                        title={"Fin del Turno"}
                                        buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'85%', height:40, borderRadius: 10, alignSelf:'center'}}
                                        titleStyle={{fontSize: 18, lineHeight: 20}}
                                        onPress={this.handleFinTurnoClick.bind(this)}
                                    />
                                </View>
                        }
                    </View>
                </View>
            </View>
        )
    }
}