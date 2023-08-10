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
import { Button, Tab, TabView, CheckBox } from 'react-native-elements';
import * as Progress from 'react-native-progress';
import Spinner from 'react-native-loading-spinner-overlay';
import { inicioTurnoPromise, finTurnoPromise, getTurnoPromise, startInterruptionPromise, finishInterruptionPromise } from './promises';
import { FasePage } from '.';
import StylesGlobal from './StylesGlobal';
import { apiRequestorHelper } from '../helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        stopFaena: true,
        isLoadingInterruption: false,
        isLoadingApi: false,
        modoOnline: true,
        requestPending: [],
        attemptingCalls: false,
        keyFase: Math.random()
    }

    constructor(props) {
        super(props)
        this.backAction = this.backActionHandler.bind(this);
    }

    setTurno(t) {
        t.return = this.props.turno.return
        t.molino.activeStage = t.molino.stages.length - 1
        this.setState({
            turno: t,
            keyFase: Math.random()
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

    async verifyPendingTasks() {
        const rp = await AsyncStorage.getItem('requestPending')
        const t = await AsyncStorage.getItem('turno')
        if(rp && rp !== "" && t && t !== "") {
            const requestPending = JSON.parse(rp);
            const _turno = JSON.parse(t);
            if(_turno.molino.id === this.props.turno.molino.id && requestPending && requestPending.length > 0) {
                this.setState({ modoOnline: false, requestPending})
                if(_turno.id === this.props.turno.id) {
                    this.setTurno(_turno)
                }

                this.setState({isLoadingApi: true})
                const t = await this.handleConnectionInit(false, requestPending)
                this.setState({isLoadingApi: false})
                if(t.turno && t.id === this.props.turno.id) {
                    this.setTurno(t.turno)
                }
            }
        }
    }

    componentDidMount() {
        this.init()
        BackHandler.addEventListener(
            "hardwareBackPress",
            this.backActionHandler
        );
        this.verifyPendingTasks();
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

    inicioTurnoOnError(turno, config) {
        const t = { ...turno, open: true}
        this.setTurno(t)
        this.handleConnection({ status: false, config, turno: t })
    }

    handleInicioTurnoClick() {
        const { turno, isVisibleInterruption } = this.state
        if(turno.status !== 'OPEN') {
            Alert.alert(
                "Inicio de Turno",
                "Confirma el Inicio del Turno: " +this.getTurnoDesc(turno.name)+ "?",
                [
                  {
                    text: "Cancelar",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                  },
                  { text: "Iniciar Turno", onPress: async () => {
                        const conn = await this.handleConnection();
                        if(!conn.errores && conn.turno) {
                            this.setTurno(conn.turno)
                        }
                        inicioTurnoPromise(turno.id, !conn.errores).then(r => {
                            if(r.data) {
                                r.data.open = true
                                this.setTurno(r.data)
                                this.handleConnection({ status: true })
                            }else {
                                this.inicioTurnoOnError(turno, r.config)
                            }
                        })
                        .catch(e => {
                            this.inicioTurnoOnError(turno, e.config)
                        })
                    }
                  }
                ]
            );
        }else {
            this.setTurno({ ...turno, open: true })
        }
    }

    finTurnoOnError(turno, config) {
        const t = { ...turno, open: false }
        this.setTurno(t)
        this.handleConnection({ status: false, config, turno: t })
    }

    async finTurno() {
        const { turno } = this.state
        const conn = await this.handleConnection();
        if(!conn.errores && conn.turno) {
            this.setTurno(conn.turno)
        }
        await finTurnoPromise(turno.id, !conn.errores).then(r => {
            if(r.data) {
                this.setTurno(r.data)
                this.handleConnection({ status: true })
            }else {
                this.finTurnoOnError(turno, r.config)
            }
        })
        .catch(e => {
            this.finTurnoOnError(turno, e.config)
        });
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

    startInterruptionOnError(turno, config) {
        let _turno = { ...turno, open: true }
        _turno.molino.currentStage.hasInterruption = true
        _turno.molino.currentStage.events.push({type: 'INTERRUPTION', finishDate: null})
        this.setTurno(_turno)
        this.handleConnection({ status: false, config, turno: _turno })
    }

    async handleStartInterruption() {
        const { turno, comments, stopFaena } = this.state
        this.setState({isLoadingInterruption:true})
        const conn = await this.handleConnection();
        if(!conn.errores && conn.turno) {
            this.setTurno(conn.turno)
        }
        startInterruptionPromise(turno.id, stopFaena, comments, !conn.errores).then(t => {
            this.setState({
                comments: null,
                stopFaena: true,
                isLoadingInterruption: false,
                isVisibleInterruption: stopFaena
            })
            if(t.data) {
                this.setTurno({ ...t.data, open: true })
                this.handleConnection({ status: true })
            }else {
                this.startInterruptionOnError(turno, t.config)
            }
        })
        .catch(e => {
            this.setState({
                comments: null,
                stopFaena: true,
                isLoadingInterruption: false,
                isVisibleInterruption: stopFaena
            })
            this.startInterruptionOnError(turno, e.config)
        });
    }

    finishInterruptionOnError(turno, config) {
        const _turno = { ...turno, open: true }
        _turno.molino.currentStage.hasInterruption = false
        _turno.molino.currentStage.events.filter(e => e.type === 'INTERRUPTION' && e.finishDate === null).map(e => {
            e.finishDate = Date.now()
        })
        this.setTurno(_turno)
        this.handleConnection({ status: false, config, turno: _turno })
    }

    async handleFinishInterruption() {
        const { turno } = this.state
        this.setState({isLoadingInterruption:true})
        const conn = await this.handleConnection();
        if(!conn.errores && conn.turno) {
            this.setTurno(conn.turno)
        }
        finishInterruptionPromise(turno.id, !conn.errores).then(t => {
            this.setState({
                isVisibleInterruption: false,
                isLoadingInterruption: false
            })
            if(t.data) {
                this.setTurno({ ...t.data, open: true })
                this.handleConnection({ status: true })
            }else {
                this.finishInterruptionOnError(turno, t.config)
            }
        })
        .catch(e => {
            this.setState({
                isVisibleInterruption: false,
                isLoadingInterruption: false
            })
            this.finishInterruptionOnError(turno, e.config)
        });
    }

    handleFinTurnoClick() {
        const { turno } = this.state
        Alert.alert(
            "Fin de Turno",
            "Confirma el Fin del Turno: " +this.getTurnoDesc(turno.name)+ "?",
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

    async handleConnectionInit(modoOnline, requestPending) {
        if(!modoOnline && requestPending.length > 0) {
            console.log('Intenta liberar pendientes: ' + requestPending.length);
            this.setState({attemptingCalls: true})
            let errores = false
            let pending = [...requestPending]
            let _turno = null
            for(let i=0;i<requestPending.length;i++) {
                const config = requestPending[i]
                if(config) {
                    //config.url = config.url.replace('Task1','Task')
                    //config.url = config.url.replace('Parte1','Parte')
                    //config.url = config.url.replace('Turno1','Turno')
                    const response = await new Promise((resolve, reject) => apiRequestorHelper({ cfg: config }, false).then(r => resolve(r)).catch(e => resolve({error:true})));
                    if(response.error) {
                        errores = true
                        break;
                    }else {
                        pending[i].success = true;
                        this.setState({requestPending: pending})
                        const t = await getTurnoPromise(this.state.turno.id, false);
                        if(t && !t.error) {
                            _turno = t
                        }
                    }
                }
            }
            const pendingNotSuccess = pending.filter(p => p && p.success === undefined)
            this.setState({requestPending: pendingNotSuccess, modoOnline: !errores, attemptingCalls: false})

            AsyncStorage.setItem('requestPending', JSON.stringify(pendingNotSuccess))

            if(!errores && pendingNotSuccess.length === 0) {
                Alert.alert('Información', 'Conexión restaurada, activa modo ONLINE');
                AsyncStorage.removeItem('requestPending')
                AsyncStorage.removeItem('turno')
            }

            this.setState({isLoadingApi: false})
            return { errores, turno: _turno };
        }else {
            this.setState({isLoadingApi: false})
            return { errores: requestPending.length > 0 };
        }
    }

    async handleConnection({ status, config, turno } = {} ) {
        const { requestPending, modoOnline } = this.state
        
        this.setState({isLoadingApi: true})
        if(status === undefined) {
            return this.handleConnectionInit(modoOnline, requestPending)
        }else {
            if(!status) {
                let pending = [...requestPending]
                pending.push(config)
                if(modoOnline) {
                    Alert.alert('Error', 'Se produjo un error de Conexion, activa modo OFFLINE');
                }
                this.setState({modoOnline: false, requestPending: pending})

                AsyncStorage.setItem('requestPending', JSON.stringify(pending))
                AsyncStorage.setItem('turno', JSON.stringify(turno))
            }else if(!modoOnline) {
                this.setState({modoOnline: true})
                Alert.alert('Información', 'Conexión restaurada, activa modo ONLINE');

                AsyncStorage.removeItem('requestPending')
                AsyncStorage.removeItem('turno')
            }
            this.setState({isLoadingApi: false})
        }
    }

    render() {
        const { currentUser } = this.props
        const { tabIndex, turno, isVisibleInterruption, isLoadingInterruption, stopFaena, modoOnline, isLoadingApi, requestPending, attemptingCalls } = this.state
        const {t, i18n} = this.props.screenProps; 

        return (
            <View style={{height: this.props.height}}>
                { isLoadingApi && <Spinner visible={true} /> }
                <Text style={{color: modoOnline ? 'green' : 'red', textAlign:'center'}}>
                { modoOnline ?
                    'Modo Online'
                    : attemptingCalls ?
                    <>
                        Enviando: {requestPending.filter(p => p && p.success).length}/{requestPending.length}
                    </>
                    :
                    <>
                        Modo Offline: {requestPending.length}
                    </>
                }
                </Text>
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
                                    <CheckBox
                                        title='Detener faena'
                                        checked={stopFaena}
                                        onPress={() => this.setState({stopFaena: !this.state.stopFaena})}
                                        />
                                    <Button
                                        title={stopFaena ? "Iniciar interrupción" : "Agregar comentario" }
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
                        <FasePage key={this.state.keyFase} currentUser={currentUser} turno={turno} finTurno={this.finTurno.bind(this)} returnMenu={this.returnMenuFase.bind(this)}  screenProps={this.props.screenProps} handleConnection={this.handleConnection.bind(this)} />
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
                                <Text style={{fontSize: 35, color: StylesGlobal.colorBlack90, fontWeight:'400', textAlign:'right', width:50, flexWrap:'nowrap'}}>
                                    {turno.molino.totalMontadas}
                                </Text>
                                <View style={{left:52, width:'100%', position:'absolute', top:5}}>
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
                                <View style={{left:42, position:'absolute', top:20}}>
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