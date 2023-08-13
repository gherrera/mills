import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    Dimensions,
    ScrollView,
    Alert
} from 'react-native';
import {  Button } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';
import { startEtapaPromise, finishEtapaPromise, startTaskPromise, finishTaskPromise, addPartePromise } from './promises';
import StylesGlobal from './StylesGlobal';

const styles = StyleSheet.create({
    primaryButton: {
        position: 'absolute',
        right: 5,
    },
    col: {
        alignSelf: "flex-start",
    },
})

export default class Fase extends Component {
    state = {
       turno: this.props.turno,
       isModalVisible: true,
       isLoading: {BOTADO: false, LIMPIEZA: false, MONTAJE: false},
       isModalStartExecution: false,
       activeStage: this.props.turno.molino.activeStage,
       currentStage: this.props.turno.molino.stages[this.props.turno.molino.activeStage],
       isLoadingButton: false,
       showModalReapriete: false,
       showRepriete: false,
       isLoadingGlobal: false
    }

    componentDidMount() {
        const { turno } = this.props
        const { currentStage } = this.state
        //console.log('currentStage', currentStage)
        if(currentStage.stage === 'BEGINNING' && (turno.molino.nextTask === 'RETIRO_CHUTE' || turno.molino.nextTask === 'ING_LAINERA') && currentStage.currentTask.finishDate) {
            this.setState({
                isModalStartExecution: true
            })
        }else if(currentStage.stage === 'FINISHED' && currentStage.status === 'STARTED' && turno.molino.nextTask === 'REAPRIETE' && currentStage.currentTask.finishDate) {
            this.setState({
                showModalReapriete: true
            })
        }
    }

    startTaskOnError(config) {
        const { turno } = this.state
        const { handleConnection } = this.props

        let t = {...turno}
        
        const task = { task: this.state.currentStage.nextTask, finishDate: null};
        
        if(!(t.molino.stages[this.state.activeStage].tasks)) {
            t.molino.stages[this.state.activeStage].tasks = []
        }
        t.molino.stages[this.state.activeStage].tasks.push(task)
        t.molino.stages[this.state.activeStage].currentTask = task

        if(t.molino.stages[this.state.activeStage].stage === 'EXECUTION' && t.molino.stages[this.state.activeStage].currentTask) {
            if(t.molino.stages[this.state.activeStage].currentTask.task === 'GIRO') {
                t.molino.partsByType.map(t => {
                    t.parts.map(p => {
                        p.botadas = 0
                        p.limpiadas = 0
                        p.montadas = 0
                    })
                })
            }else if(t.molino.stages[this.state.activeStage].currentTask.task === 'LIMPIEZA') {
                const taskMontaje = { task: 'MONTAJE', finishDate: null};
                t.molino.stages[this.state.activeStage].tasks.push(taskMontaje)
                t.molino.stages[this.state.activeStage].currentTask = taskMontaje
            }
        }

        t = this.setNextTask(t)

        this.setTurno(t)
        handleConnection({ status: false, config, turno: t })
    }

    startTask() {
        const {t} = this.props.screenProps; 
        const molino = this.state.turno.molino
        if(molino.nextTask) {
            Alert.alert(
                "Inicio de Tarea",
                "Confirma el Inicio la Tarea: " +t('messages.mills.task.'+molino.nextTask)+ "?",
                [
                  {
                    text: "Cancelar",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                  },
                  { text: "Iniciar Tarea", onPress: async () => {
                        const { turno } = this.state
                        const { handleConnection } = this.props

                        this.setState({ isLoadingGlobal: true })
                        const conn = await handleConnection();
                        if(!conn.errores && conn.turno) {
                            this.setTurno(conn.turno)
                        }
                        startTaskPromise(turno.id, this.state.currentStage.stage, !conn.errores).then(response => {
                            if(response.data) {
                                handleConnection({ status: true })
                                this.setTurno(response.data)
                            }else {
                                this.startTaskOnError(response.config)
                            }
                            this.setState({ isLoadingGlobal: false })
                        })
                        .catch(e => {
                            this.startTaskOnError(e.config)
                            this.setState({ isLoadingGlobal: false })
                        })
                    }
                  }
                ]
            );
        }
    }

    setNextTask(_turno) {
        let { currentStage } = this.state
        const ct = _turno.molino.stages[this.state.activeStage].currentTask
    
        if(currentStage.stage === 'BEGINNING') {
            if(ct.task === 'DET_PLANTA') {
                _turno.molino.stages[this.state.activeStage].nextTask = 'BLOQUEO_PRUEBA_ENERGIA_0'
            }else if(ct.task === 'BLOQUEO_PRUEBA_ENERGIA_0') {
                _turno.molino.stages[this.state.activeStage].nextTask = 'RETIRO_CHUTE'
            }else if(ct.task === 'RETIRO_CHUTE') {
                _turno.molino.stages[this.state.activeStage].nextTask = 'ING_LAINERA'
            }else {
                _turno.molino.stages[this.state.activeStage].nextTask = null
            }
        }else  if(currentStage.stage === 'EXECUTION') {
            if(ct.task === 'BOTADO') {
                _turno.molino.stages[this.state.activeStage].nextTask = 'LIMPIEZA'
            }else if(ct.task === 'LIMPIEZA') {
                _turno.molino.stages[this.state.activeStage].nextTask = 'MONTAJE'
            }else if(ct.task === 'MONTAJE') {
                _turno.molino.stages[this.state.activeStage].nextTask = 'GIRO'
            }else if(ct.task === 'GIRO') {
                _turno.molino.stages[this.state.activeStage].nextTask = 'BOTADO'
            }else {
                _turno.molino.stages[this.state.activeStage].nextTask = null
            }
        }else if(currentStage.stage === 'FINISHED') {
            if(ct.task === 'RET_LAINERA') {
                _turno.molino.stages[this.state.activeStage].nextTask = 'INST_CHUTE'
            }else if(ct.task === 'INST_CHUTE') {
                _turno.molino.stages[this.state.activeStage].nextTask = 'DESBLOQUEO'
            }else if(ct.task === 'DESBLOQUEO') {
                _turno.molino.stages[this.state.activeStage].nextTask = 'REAPRIETE'
            }else {
                _turno.molino.stages[this.state.activeStage].nextTask = null
            }
        }
        if(_turno.molino.stages[this.state.activeStage].nextTask === 'GIRO') {
            if(_turno.molino.totalMontadas === _turno.molino.piezas) {
                _turno.molino.stages[this.state.activeStage].nextTask = null
            }
        }else if(ct.task === 'GIRO') {
            if(_turno.molino.totalBotadas === _turno.molino.piezas) {
                _turno.molino.stages[this.state.activeStage].nextTask = 'MONTAJE'
            }
        }

        _turno.molino.nextTask = _turno.molino.stages[this.state.activeStage].nextTask

        return _turno
    }

    finishTaskOnError(config) {
        let { turno, currentStage } = this.state
        const { handleConnection } = this.props

        if(currentStage.stage === 'BEGINNING') {
            if(currentStage.nextTask === 'RETIRO_CHUTE') {
                this.setState({
                    isModalStartExecution: true
                })
            }
        }
        let _turno = {...turno}
        _turno = this.setNextTask(_turno)
        _turno.molino.stages[this.state.activeStage].currentTask.finishDate = Date.now()

        this.setTurno(_turno)
        handleConnection({ status: false, config, turno: _turno })
    }

    finishTask() {
        const {t} = this.props.screenProps; 
        const molino = this.state.turno.molino
        if(this.state.currentStage.currentTask) {
            // Se permite finalizar Botado sin piezas para avanzar a montaje
            if(false && this.state.currentStage.currentTask.task === 'BOTADO' && molino.botadas === 0) {
                Alert.alert(
                    "Error", "Debe agregar piezas a la tarea de Botado antes de Finalizar"
                );
            }else {
                Alert.alert(
                    "Fin de Tarea",
                    "Confirma el Fin de la Tarea: " +t('messages.mills.task.'+this.state.currentStage.currentTask.task)+ "?",
                    [
                    {
                        text: "Cancelar",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    },
                    { text: "Finalizar Tarea", onPress: async () => {
                            let { turno, currentStage } = this.state
                            const { handleConnection } = this.props
                            
                            this.setState({ isLoadingGlobal: true })
                            const conn = await handleConnection();
                            if(!conn.errores && conn.turno) {
                                this.setTurno(conn.turno)
                            }
                            finishTaskPromise(turno.id, currentStage.stage, !conn.errores).then(response => {
                                if(response.data) {
                                    if(currentStage.stage === 'BEGINNING') {
                                        if(currentStage.nextTask === 'RETIRO_CHUTE') {
                                            this.setState({
                                                isModalStartExecution: true
                                            })
                                        }else if(currentStage.nextTask === null && response.data.molino.stages[0].status === 'FINISHED' && response.data.molino.stages.length > 1) {
                                            this.forwardMenuHandler(response.data)
                                        }
                                    }
                                    this.setTurno(response.data)
                                    handleConnection({ status: true })
                                }else {
                                    this.finishTaskOnError(response.config)
                                }
                                this.setState({ isLoadingGlobal: false })
                            })
                            .catch(e => {
                               this.finishTaskOnError(e.config)
                               this.setState({ isLoadingGlobal: false })
                            })
                        }
                    }
                    ]
                );
            }
        }
    }

    async startNewEtapa() {
        let t = await this.startEtapa()
        this.setState({
            isModalStartExecution: false
        })
        this.forwardMenuHandler(t)
    }

    async setTurno(t, _activeStage=null) {
        const { activeStage } = this.state
        t.open = true
        let cs = t.molino.stages[_activeStage !== null ? _activeStage : activeStage]
        this.setState({
            turno: t,
            currentStage: cs,
            isLoadingButton: false
        })
        if(cs.stage === 'FINISHED' && cs.status === 'STARTED' && cs.nextTask === 'REAPRIETE' && cs.currentTask.finishDate) {
            this.setState({
                showModalReapriete: true
            })
        }
    }

    async startEtapaOnError(config, _turno) {
        const { currentStage } = this.state
        const { handleConnection } = this.props

        let newStage
        let nextTask
        if(currentStage.stage === 'BEGINNING') {
            newStage = 'EXECUTION'
            nextTask = 'BOTADO'
        }else if(currentStage.stage === 'EXECUTION') {
            newStage = 'FINISHED'
            nextTask = 'RET_LAINERA'
        }else if(currentStage.stage === 'FINISHED') {
            newStage = 'DELIVERY'
        }
        _turno.molino.stage = newStage
        _turno.molino.nextTask = nextTask
        _turno.molino.stages.push( { stage: newStage, currentTask: null, tasks: [], nextTask, finishDate: null })
        
        handleConnection({ status: false, config, turno: _turno })

        return _turno
    }

    async startEtapa() {
        this.setState({
            isLoadingButton: true
        })
        const { turno } = this.state
        const { handleConnection } = this.props
        let _turno = turno

        this.setState({ isLoadingGlobal: true })
        const conn = await handleConnection();
        if(!conn.errores && conn.turno) {
            this.setTurno(conn.turno)
        }
        await startEtapaPromise(turno.id, !conn.errores).then(async (response) => {
            if(response.data) {
                handleConnection({ status: true })
                _turno = response.data
            }else {
                _turno = await this.startEtapaOnError(response.config, _turno)
            }
            this.setState({ isLoadingGlobal: false })
        })
        .catch(async (e) => {
            _turno = await this.startEtapaOnError(e.config, _turno)
            this.setState({ isLoadingGlobal: false })
        });
        return _turno
    }

    addParteOnError(config, task, parte) {
        const { turno } = this.state
        const { handleConnection } = this.props

        let _turno = {...turno}
        let cs = _turno.molino.stages[this.state.activeStage]
        //_turno.molino.stages[this.state.activeStage].finishDate = Date.now()
        
        const tarea = cs.tasks.filter(t => t.task === task)[0];
        if(task === 'BOTADO' && parte.qty >= (parte.totalBotadas + 1)) {
            parte.botadas = parte.botadas+1
            parte.totalBotadas = parte.totalBotadas+1
            _turno.molino.botadas = _turno.molino.botadas+1
            _turno.molino.totalBotadas = _turno.molino.totalBotadas+1
        }else if(task === 'LIMPIEZA' && parte.botadas >= (parte.limpiadas + 1)) {
            parte.limpiadas = parte.limpiadas+1
            parte.totalLimpiadas = parte.totalLimpiadas+1
            _turno.molino.limpiadas = _turno.molino.limpiadas+1
            if(_turno.molino.botadas === _turno.molino.limpiadas) {
                tarea.finishDate = Date.now()
            }
        }else if(task === 'MONTAJE') {
            parte.montadas = parte.montadas+1
            parte.totalMontadas = parte.totalMontadas+1
            _turno.molino.montadas = _turno.molino.montadas+1
            _turno.molino.totalMontadas = _turno.molino.totalMontadas+1
            if(_turno.molino.totalBotadas === _turno.molino.totalMontadas) {
                tarea.finishDate = Date.now()
            }
        }
        let parts = _turno.molino.partsByType.filter(p => p.type === parte.type)[0].parts;
        parts.map(p => {
            if(p.id === parte.id) {
                p = parte;
            }
        })
        this.setTurno(_turno)

        handleConnection({ status: false, config, turno: _turno })
    }
    
    async addParte(task, parte) {
        const { isLoading } = this.state
        const { turno } = this.state
        isLoading[task] = true
        this.setState({
            isLoading
        })
        const { handleConnection } = this.props

        this.setState({ isLoadingGlobal: true })
        const conn = await handleConnection();
        if(!conn.errores && conn.turno) {
            this.setTurno(conn.turno)
        }
        addPartePromise(turno.id, task, parte.id, !conn.errores).then(response => {
            if(response.data) {
                handleConnection({ status: true })
                this.setTurno(response.data)
            }else {
                this.addParteOnError(response.config, task, parte)
            }
            isLoading[task] = false
            this.setState({
                isLoading
            })
            this.setState({ isLoadingGlobal: false })
        })
        .catch(e => {
            this.addParteOnError(e.config, task, parte)

            isLoading[task] = false
            this.setState({
                isLoading
            })
            this.setState({ isLoadingGlobal: false })
        });
    }

    getBotonAddParte(task, parte) {
        const { isLoading } = this.state
        return (
            <Button
                icon={ {name:"pluscircleo", type:"antdesign", size:27} }
                buttonStyle={{
                    width: 37, 
                    height:27, 
                    padding: 0
                }}
                loading={isLoading[task]}
                type="clear"
                onPress={() => this.addParte(task, parte)}
            />
        )
    }

    forwardMenuHandler(t) {
        this.setState({
            activeStage: t.molino.stages.length-1
        })
        this.setTurno(t, t.molino.stages.length-1)
    }

    returnMenuHandler() {
        const { returnMenu } = this.props
        const { turno, currentStage } = this.state
        const molino = turno.molino

        if(turno.open !== true) returnMenu()
        else if(currentStage.stage === 'FINISHED' && molino.status === 'FINISHED') {
            Alert.alert(
                "Finalizar turno",
                "Debe Finalizar el turno para salir"
            );
        }else if(currentStage.stage === 'EXECUTION'){
            if(molino.stages[0].status === 'STARTED') {
                this.setState({
                    activeStage: 0
                })
                this.setTurno(turno, 0)
            }else {
                returnMenu()
            }
        }else {
            returnMenu()
        }
    }

    finalizarTurno() {
        this.setState({
            isLoadingButton: true
        })
        this.props.finTurno()
        this.setState({
            isModalVisible: false
        })
        const { returnMenu } = this.props
        returnMenu()
    }

    async deliveryMolino() {
        await this.startEtapa()
        this.returnMenuHandler()
    }

    startReapriete() {
        this.setState({
            isLoadingButton: true,
            showModalReapriete: false,
            showRepriete: true
        })
    }

    finishEtapaOnError(turno, config) {
        const { handleConnection } = this.props

        let _turno = {...turno}
        _turno.molino.stages[this.state.activeStage].finishDate = Date.now()
        this.setTurno(_turno)

        handleConnection({ status: false, config, turno: _turno })
    }

    async noReapriete() {
        this.setState({
            isLoadingButton: true
        })
        const { turno } = this.state
        const { handleConnection } = this.props

        this.setState({ isLoadingGlobal: true })
        const conn = await handleConnection();
        if(!conn.errores && conn.turno) {
            this.setTurno(conn.turno)
        }
        finishEtapaPromise(turno.id, !conn.errores).then(response => {
            if(response.data) {
                this.setTurno(response.data)
            }else {
                this.finishEtapaOnError(turno, response.config)
            }
            this.setState({
                showModalReapriete: false
            })
            this.setState({ isLoadingGlobal: false })
        })
        .catch(e => {
            this.finishEtapaOnError(turno, e.config)

            this.setState({
                showModalReapriete: false
            })
            this.setState({ isLoadingGlobal: false })
        })
    }

    render() {
        const { turno, isModalVisible, isModalStartExecution, currentStage, isLoadingButton, showModalReapriete, showRepriete, isLoadingGlobal } = this.state
        const {t, i18n} = this.props.screenProps; 
        const molino = turno.molino

        return (
            <View style={{height:'100%'}}>
                { isLoadingGlobal && <Spinner visible={true} /> }
                <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                    <View style={{ ...styles.col, width: '10%', textAlign:'center'}}>
                        <Button
                            buttonStyle={{padding:0, width:30, height:30, backgroundColor:"transparent"}}
                            style={{color:"#000"}}
                            onPress={this.returnMenuHandler.bind(this)}
                            icon={{
                                name: "arrow-back-ios",
                                color: StylesGlobal.colorBlack75
                            }}
                        />
                    </View>
                    <View style={{ ...styles.col, width: '80%', textAlign:'center'}}>
                        <Text style={{fontSize: 25, textAlign: 'center', color: StylesGlobal.colorBlack75, fontWeight:'600', top:0, width:'100%'}}>
                            { currentStage.stage === 'BEGINNING' ? "FASE INICIO"
                            : currentStage.stage === 'EXECUTION' ? "FASE EJECUCION"
                            : currentStage.stage === 'FINISHED' ? "FASE TERMINO"
                            : "ENTREGADO"
                            }
                        </Text>
                    </View>
                    <View style={{ ...styles.col, width: '10%', alignItems:'flex-end'}}>
                        { currentStage.stage === 'BEGINNING' && currentStage.status === 'STARTED' && molino.stages.length > 1 &&
                            <Button
                                buttonStyle={{padding:0, width:30, height:30, backgroundColor:"transparent"}}
                                style={{color:"#000"}}
                                onPress={() => this.forwardMenuHandler(turno)}
                                icon={{
                                    name: "arrow-forward-ios",
                                    color: StylesGlobal.colorBlack75
                                }}
                            />
                        }
                    </View>
                </View>
               
                <View
                    style={{
                        borderBottomColor: StylesGlobal.colorBlack75,
                        borderBottomWidth: 1,
                        marginTop: 5,
                    }}
                />
                { showModalReapriete &&
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
                            marginTop: (Dimensions.get('window').height-400)/2, 
                            borderRadius:15, 
                            padding:12,
                            borderColor:StylesGlobal.colorGray, 
                            borderWidth:3}}>
                            <Text style={{fontSize:25, padding:12, textAlign:'center', color: StylesGlobal.colorBlack90}}>
                                Desea hacer reapriete de Piezas?
                            </Text>
                            <Button
                                title="Sí"
                                titleStyle={{fontSize:26, textAlign:'center'}}
                                buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'80%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10 }}
                                onPress={this.startReapriete.bind(this)}
                                loading={isLoadingButton}
                            />
                            <Button
                                title="No"
                                titleStyle={{fontSize:26, textAlign:'center'}}
                                buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'80%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10 }}
                                onPress={this.noReapriete.bind(this)}
                                loading={isLoadingButton}
                            />
                        </View>
                    </Modal>
                }
                { isModalStartExecution &&
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
                            marginTop: (Dimensions.get('window').height-400)/2, 
                            borderRadius:15, 
                            padding:12,
                            borderColor:StylesGlobal.colorGray, 
                            borderWidth:3}}>
                            <Text style={{fontSize:25, padding:12, textAlign:'center', color: StylesGlobal.colorBlack90}}>
                                Ha finalizado el proceso de 
                                { turno.molino.nextTask === 'RETIRO_CHUTE' ? " Bloqueo" 
                                : " Retiro Chute"
                                }
                                .
                            </Text>
                            <Text style={{fontSize:25, padding:12, textAlign:'center', color: StylesGlobal.colorBlack90}}>
                                ¿Inicia la fase de Ejecución?
                            </Text>
                            <Button
                                title="Iniciar"
                                titleStyle={{fontSize:26, textAlign:'center'}}
                                buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'80%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10 }}
                                onPress={this.startNewEtapa.bind(this)}
                                loading={isLoadingButton}
                            />
                            <Button
                                title="Aún no"
                                type="clear"
                                titleStyle={{fontSize:26, textAlign:'center', color:'rgba(0,0,0,0.9)'}}
                                buttonStyle={{width:'80%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10, borderColor: StylesGlobal.colorGray, borderWidth:2 }}
                                onPress={() => this.setState({isModalStartExecution:false})}
                            />
                        </View>
                    </Modal>
                }
                { currentStage.stage === 'FINISHED' && currentStage.status === 'FINISHED' &&
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={isModalVisible}
                    >
                        <View style={{
                            backgroundColor: 'rgba(255,255,255,.98)', 
                            width:'85%', 
                            height:'40%', 
                            alignSelf:'center', 
                            marginTop: Dimensions.get('window').height*0.3, 
                            borderRadius:15, 
                            padding:12,
                            borderColor:StylesGlobal.colorGray, 
                            borderWidth:3}}>
                            <Text style={{fontSize:25, padding:18, textAlign:'center', color: StylesGlobal.colorBlack90}}>
                                Ha finalizado todas las tareas de la mantención.
                            </Text>
                            <Button
                                title="Entrega de Equipo"
                                titleStyle={{fontSize:26, textAlign:'center'}}
                                buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'80%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10 }}
                                onPress={this.deliveryMolino.bind(this)}
                                loading={isLoadingButton}
                            />
                        </View>
                    </Modal>
                }
                { (currentStage.stage === 'BEGINNING' || currentStage.stage === 'EXECUTION') &&
                <> 
                    { currentStage.currentTask &&  currentStage.currentTask.finishDate && molino.nextTask === null &&
                        <Modal
                            animationType="fade"
                            transparent={true}
                            visible={isModalVisible}
                        >
                            <View style={{
                                backgroundColor: 'rgba(255,255,255,.98)', 
                                width:'85%', 
                                height:'60%', 
                                alignSelf:'center', 
                                marginTop: Dimensions.get('window').height*0.2, 
                                borderRadius:15, 
                                padding:12,
                                borderColor:StylesGlobal.colorGray, 
                                borderWidth:3}}>
                                <Text style={{fontSize:25, padding:12, textAlign:'center', color: StylesGlobal.colorBlack90}}>
                                    Ha finalizado todos los procesos de 
                                    { currentStage.stage === 'BEGINNING' ? " inicio" 
                                    : " ejecución"
                                    }
                                    .
                                </Text>
                                <Text style={{fontSize:25, padding:12, textAlign:'center', color: StylesGlobal.colorBlack90}}>
                                    ¿Inicia la fase de 
                                    { currentStage.stage === 'BEGINNING' ? " Ejecución"
                                    : " Término"
                                    }
                                    ?
                                </Text>
                                <Button
                                    title="Iniciar"
                                    titleStyle={{fontSize:26, textAlign:'center'}}
                                    buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'80%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10 }}
                                    onPress={this.startNewEtapa.bind(this)}
                                    loading={isLoadingButton}
                                />
                                <Button
                                    title="Finalizar Turno"
                                    titleStyle={{fontSize:26, textAlign:'center'}}
                                    buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'80%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10 }}
                                    onPress={this.finalizarTurno.bind(this)}
                                    loading={isLoadingButton}
                                />
                            </View>
                        </Modal>
                    }
                </>
                }
                <Text style={{fontSize:19, backgroundColor: StylesGlobal.colorGray25, color: 'black', borderRadius:10, padding:7, textAlign:'center', marginTop: 10}}>
                    { currentStage.currentTask &&  currentStage.currentTask.finishDate === null && currentStage.currentTask.task === 'MONTAJE' ?
                        "El proceso de Montaje finalizará automáticamente cuando registre todas las piezas"
                    : currentStage.currentTask &&  currentStage.currentTask.finishDate === null ?
                        "Finalice el proceso de " + t('messages.mills.task.'+currentStage.currentTask.task)
                    : molino.nextTask && molino.nextTask === 'BOTADO' ?
                        "Inicie el proceso de " + t('messages.mills.task.'+molino.nextTask) +
                        " y registre las piezas en la medida que avance la actividad"
                    : molino.nextTask && molino.nextTask === 'LIMPIEZA' ?
                        "Inicie el proceso de " + t('messages.mills.task.'+molino.nextTask) + " y " + t('messages.mills.task.MONTAJE') +
                        " y registre las piezas en la medida que avance la actividad"
                    : molino.nextTask ?
                        "Inicie el proceso de " + t('messages.mills.task.'+molino.nextTask)
                    :
                        "Fase Finalizada"
                    }
                </Text>
                { currentStage.currentTask &&  currentStage.currentTask.finishDate === null && currentStage.currentTask.task === 'MONTAJE' &&  molino.limpiadas === molino.botadas ?
                    <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                        <View style={{ ...styles.col, width: '100%', textAlign:'center', padding:16}}>
                            <Button
                                title="No continuar montaje"
                                type={"solid"}
                                buttonStyle={{padding:5, borderColor: StylesGlobal.colorGray, borderWidth:1.4, borderRadius:5, backgroundColor: "rgba(0,0,0,0.85)"}}
                                titleStyle={{fontSize:20}}
                                loading={isLoadingButton}
                                onPress={this.finishTask.bind(this)}
                            />
                        </View>
                    </View>
                    :
                    (currentStage.stage === 'BEGINNING' 
                        || currentStage.stage === 'FINISHED' 
                        || (currentStage.stage === 'EXECUTION' && 
                            (currentStage.currentTask === null || 
                                currentStage.currentTask.task === 'BOTADO' || 
                                currentStage.currentTask.task === 'GIRO' || 
                                (molino.nextTask === 'GIRO' && currentStage.currentTask.finishDate !== null && molino.totalMontadas < molino.piezas)
                            )
                        )
                    ) &&
                    <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                        <View style={{ ...styles.col, width: '50%', textAlign:'center', padding:16}}>
                            <Button
                                title="Inicio"
                                type={molino.nextTask === null || (currentStage.currentTask &&  currentStage.currentTask.finishDate === null)?"clear":"solid"}
                                disabled={molino.nextTask === null || (currentStage.currentTask &&  currentStage.currentTask.finishDate === null)}
                                titleStyle={{fontSize:20}}
                                buttonStyle={{padding:5, borderColor: StylesGlobal.colorGray, borderWidth:1.4, borderRadius:5, backgroundColor: (molino.nextTask === null || (currentStage.currentTask &&  currentStage.currentTask.finishDate === null)) ? "transparent": "rgba(0,0,0,0.85)"}}
                                onPress={this.startTask.bind(this)}
                            />
                        </View>
                        <View style={{ ...styles.col, width: '50%', textAlign:'center', padding:16}}>
                            <Button
                                title="Fin"
                                type={!(currentStage.currentTask &&  currentStage.currentTask.finishDate === null)?"clear":"solid"}
                                disabled={!(currentStage.currentTask &&  currentStage.currentTask.finishDate === null)}
                                buttonStyle={{padding:5, borderColor: StylesGlobal.colorGray, borderWidth:1.4, borderRadius:5, backgroundColor: (molino.nextTask === null || (currentStage.currentTask &&  currentStage.currentTask.finishDate === null)) ? "rgba(0,0,0,0.85)": "transparent"}}
                                titleStyle={{fontSize:20}}
                                onPress={this.finishTask.bind(this)}
                            />
                        </View>
                    </View>
                }

                { false && currentStage.currentTask && currentStage.currentTask.finishDate === null &&
                    <Text style={{fontSize:20, color: StylesGlobal.colorBlack90, borderRadius:10, textAlign:'center'}}>
                    { currentStage.currentTask.finishDate === null && currentStage.currentTask.task !== 'LIMPIEZA' ?
                        "Proceso de " + t('messages.mills.task.'+currentStage.currentTask.task) + " en curso"
                    : currentStage.currentTask.finishDate === null && currentStage.currentTask.task === 'LIMPIEZA' ?
                        "Proceso de " + t('messages.mills.task.'+currentStage.currentTask.task) + " y " + t('messages.mills.task.MONTAJE') +" en curso"
                    : currentStage.currentTask &&
                        "Fin del proceso de " + t('messages.mills.task.'+currentStage.currentTask.task)
                    }
                    </Text>
                }

                { (currentStage.stage === 'BEGINNING' || currentStage.stage === 'FINISHED') ?
                <>
                    <View
                        style={{
                            borderBottomColor: StylesGlobal.colorBlack75,
                            borderBottomWidth: 1,
                            marginTop: 13,
                        }}
                    />

                    <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                        { currentStage.stage === 'BEGINNING' &&
                        <>
                            <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                <Text style={{fontSize:22, color:StylesGlobal.colorBlack90}}>{t('messages.mills.task.DET_PLANTA')}</Text>
                            </View>
                            <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                { currentStage.currentTask &&
                                    <Text style={{fontSize:20, color: StylesGlobal.colorBlack, width:120, padding:5, backgroundColor:StylesGlobal.colorGray50, textAlign:'center'}}>
                                        { currentStage.currentTask.task !== 'DET_PLANTA' ?
                                        "Finalizado"
                                        : currentStage.currentTask.task === 'DET_PLANTA' && currentStage.currentTask.finishDate === null ?
                                        "En curso"
                                        : 
                                        "Finalizado"
                                        }
                                    </Text>
                                }
                            </View>

                            <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                <Text style={{fontSize:22, color:StylesGlobal.colorBlack90}}>{t('messages.mills.task.BLOQUEO_PRUEBA_ENERGIA_0')}</Text>
                            </View>
                            <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                { currentStage.currentTask && currentStage.currentTask.task !== 'DET_PLANTA' &&
                                    <Text style={{fontSize:20, color: StylesGlobal.colorBlack, width:120, padding:5, backgroundColor:StylesGlobal.colorGray50, textAlign:'center'}}>
                                        { currentStage.currentTask.task !== 'BLOQUEO_PRUEBA_ENERGIA_0' ?
                                        "Finalizado"
                                        : currentStage.currentTask.task === 'BLOQUEO_PRUEBA_ENERGIA_0' && currentStage.currentTask.finishDate === null ?
                                        "En curso"
                                        : currentStage.currentTask.task === 'BLOQUEO_PRUEBA_ENERGIA_0' &&
                                        "Finalizado"
                                        }
                                    </Text>
                                }
                            </View>

                            <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                <Text style={{fontSize:22, color:StylesGlobal.colorBlack90}}>{t('messages.mills.task.RETIRO_CHUTE')}</Text>
                            </View>
                            <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                { currentStage.currentTask && currentStage.currentTask.task !== 'DET_PLANTA' && currentStage.currentTask.task !== 'BLOQUEO_PRUEBA_ENERGIA_0' &&
                                    <Text style={{fontSize:20, color: StylesGlobal.colorBlack, width:120, padding:5, backgroundColor:StylesGlobal.colorGray50, textAlign:'center'}}>
                                        { currentStage.currentTask.task !== 'RETIRO_CHUTE' ?
                                        "Finalizado"
                                        : currentStage.currentTask.task === 'RETIRO_CHUTE' && currentStage.currentTask.finishDate === null ?
                                        "En curso"
                                        : currentStage.currentTask.task === 'RETIRO_CHUTE' &&
                                        "Finalizado"
                                        }
                                    </Text>
                                }
                            </View>

                            <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                <Text style={{fontSize:22, color:StylesGlobal.colorBlack90}}>{t('messages.mills.task.ING_LAINERA')}</Text>
                            </View>
                            <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                { currentStage.currentTask && currentStage.currentTask.task === 'ING_LAINERA' &&
                                    <Text style={{fontSize:20, color: StylesGlobal.colorBlack, width:120, padding:5, backgroundColor:StylesGlobal.colorGray50, textAlign:'center'}}>
                                        { currentStage.currentTask.finishDate === null ?
                                        "En curso"
                                        : 
                                        "Finalizado"
                                        }
                                    </Text>
                                }
                            </View>
                        </>
                        }
                        { currentStage.stage === 'FINISHED' &&
                        <>
                            <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                <Text style={{fontSize:22, color:StylesGlobal.colorBlack90}}>{t('messages.mills.task.RET_LAINERA')}</Text>
                            </View>
                            <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                { currentStage.currentTask &&
                                    <Text style={{fontSize:20, color: StylesGlobal.colorBlack, width:120, padding:5, backgroundColor:StylesGlobal.colorGray50, textAlign:'center'}}>
                                        { currentStage.currentTask.task === 'RET_LAINERA' && currentStage.currentTask.finishDate === null ?
                                          "En curso"
                                        : "Finalizado"
                                        }
                                    </Text>
                                }
                            </View>

                            <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                <Text style={{fontSize:22, color:StylesGlobal.colorBlack90}}>{t('messages.mills.task.INST_CHUTE')}</Text>
                            </View>
                            <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                { currentStage.currentTask && currentStage.currentTask.task !== 'RET_LAINERA' &&
                                    <Text style={{fontSize:20, color: StylesGlobal.colorBlack, width:120, padding:5, backgroundColor:StylesGlobal.colorGray50, textAlign:'center'}}>
                                        { currentStage.currentTask.task === 'INST_CHUTE' && currentStage.currentTask.finishDate === null ?
                                          "En curso"
                                        : "Finalizado"
                                        }
                                    </Text>
                                }
                            </View>

                            <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                <Text style={{fontSize:22, color:StylesGlobal.colorBlack90}}>{t('messages.mills.task.DESBLOQUEO')}</Text>
                            </View>
                            <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                { currentStage.currentTask && currentStage.currentTask.task !== 'RET_LAINERA' && currentStage.currentTask.task !== 'INST_CHUTE' &&
                                    <Text style={{fontSize:20, color: StylesGlobal.colorBlack, width:120, padding:5, backgroundColor:StylesGlobal.colorGray50, textAlign:'center'}}>
                                        { currentStage.currentTask.task === 'DESBLOQUEO' && currentStage.currentTask.finishDate === null ?
                                          "En curso"
                                        : "Finalizado"
                                        }
                                    </Text>
                                }
                            </View>

                            { (showRepriete || (currentStage.currentTask && currentStage.currentTask.task === 'REAPRIETE')) &&
                            <>
                                <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                    <Text style={{fontSize:22, color:StylesGlobal.colorBlack90}}>{t('messages.mills.task.REAPRIETE')}</Text>
                                </View>
                                <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                    { currentStage.currentTask && currentStage.currentTask.task !== 'RET_LAINERA' && currentStage.currentTask.task !== 'INST_CHUTE' && currentStage.currentTask.task !== 'DESBLOQUEO' &&
                                        <Text style={{fontSize:20, color: StylesGlobal.colorBlack, width:120, padding:5, backgroundColor:StylesGlobal.colorGray50, textAlign:'center'}}>
                                            { currentStage.currentTask.task === 'REAPRIETE' && currentStage.currentTask.finishDate === null ?
                                              "En curso"
                                            : "Finalizado"
                                            }
                                        </Text>
                                    }
                                </View>
                            </>
                            }
                        </>
                        }
                    </View>
                </>
                : currentStage.stage === 'EXECUTION' ?
                <>
                    <View style={{flexDirection: "row", flexWrap: "wrap", borderBottomColor: StylesGlobal.colorBlack, borderBottomWidth: 1, marginTop: 10, marginBottom: 5}} textAlign="flex-start">
                        <View style={{ ...styles.col, width: '55%', padding:5}}>
                            <Text style={{fontSize:18, color: StylesGlobal.colorBlack}}>
                                Giros: {turno.molino.giros}
                            </Text>
                        </View>
                        <View style={{ ...styles.col, width: '20%', padding:5}}>
                            <Text style={{fontSize:16, padding:1, color: StylesGlobal.colorBlack, textAlign:'center', backgroundColor: StylesGlobal.colorGray25, width:'100%'}}>
                                Piezas
                            </Text>
                        </View>
                        <View style={{ ...styles.col, width: '25%', padding:5}}>
                            <Text style={{fontSize:16, padding:1, color: StylesGlobal.colorBlack, textAlign:'center', backgroundColor: StylesGlobal.colorGray25, width:'100%'}}>
                                Restantes
                            </Text>
                        </View>
                    </View>
                   
                    <ScrollView>
                    { turno.molino.partsByType.map((type, indexType) => 
                        type.parts.map((part, indexPart) =>
                            <React.Fragment key={"type-"+type.type+"-"+part.id}>
                                <View style={{flexDirection: "row", flexWrap: "wrap", backgroundColor: StylesGlobal.colorYellow50}} textAlign="flex-start">
                                    <View style={{ ...styles.col, width: '40%', padding:5}}>
                                        <Text style={{fontSize:20, color:StylesGlobal.colorBlack}}>{type.type}</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '60%', padding:5}}>
                                        <Text style={{fontSize:18, color: 'white', width:'99%', padding:2, paddingLeft:10, backgroundColor:StylesGlobal.colorBlack90}}>
                                            {part.name}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: "row", flexWrap: "wrap", borderBottomColor: StylesGlobal.colorBlack, borderBottomWidth: indexType < turno.molino.partsByType.length-1 || indexPart < type.parts.length-1 ? 1:0, marginBottom: 5}}>
                                    <View style={{ ...styles.col, width: '40%', padding:5}}>
                                        <Text style={{fontSize:20, color:StylesGlobal.colorBlack}}>Botado</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '15%', textAlign:'center', padding:5}}>
                                        { currentStage.currentTask && currentStage.currentTask.task === 'BOTADO' 
                                            && currentStage.currentTask.finishDate === null 
                                            && part.totalBotadas < part.qty &&
                                            this.getBotonAddParte('BOTADO', part)
                                        }
                                    </View>
                                    <View style={{ ...styles.col, width: '20%', padding:5}}>
                                        { (part.botadas > 0 || (part.qty - part.totalBotadas) > 0 || currentStage.currentTask.task === 'BOTADO') &&
                                            <Text style={{fontSize:18, padding:1, color: StylesGlobal.colorBlack, textAlign:'center', backgroundColor: StylesGlobal.colorGray25, width:'100%'}}>
                                                {part.botadas}
                                            </Text>
                                        }
                                    </View>
                                    <View style={{ ...styles.col, width: '25%', padding:5}}>
                                        { (part.botadas > 0 || (part.qty - part.totalBotadas) > 0 || currentStage.currentTask.task === 'BOTADO') &&
                                            <Text style={{fontSize:18, padding:1, color: StylesGlobal.colorBlack, textAlign:'center', backgroundColor: StylesGlobal.colorGray25, width:'95%'}}>
                                                {part.qty - part.totalBotadas}
                                            </Text>
                                        }
                                    </View>

                                    <View style={{ ...styles.col, width: '40%', padding:5}}>
                                        <Text style={{fontSize:20, color:StylesGlobal.colorBlack}}>Limpieza</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '15%', textAlign:'center', padding:5}}>
                                        { currentStage.currentTask && currentStage.currentTask.task !== 'BOTADO' 
                                            && part.limpiadas < part.botadas &&
                                            this.getBotonAddParte('LIMPIEZA', part)
                                        }
                                    </View>
                                    <View style={{ ...styles.col, width: '20%', textAlign:'center', padding:5}}>
                                        { currentStage.currentTask && currentStage.currentTask.task !== 'BOTADO' && part.botadas > 0 &&
                                            <Text style={{fontSize:20, padding:1, color: StylesGlobal.colorBlack, textAlign:'center', backgroundColor: StylesGlobal.colorGray25, width:'100%'}}>
                                                {part.limpiadas}
                                            </Text>
                                        }
                                    </View>

                                    <View style={{ ...styles.col, width: '40%', padding:5}}>
                                        <Text style={{fontSize:20, color:StylesGlobal.colorBlack}}>Montaje</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '15%', textAlign:'center', padding:5}}>
                                        { currentStage.currentTask && (currentStage.currentTask.task === 'LIMPIEZA' || currentStage.currentTask.task === 'MONTAJE' )
                                            && currentStage.currentTask.finishDate === null
                                            && (part.botadas === part.limpiadas && part.totalMontadas < part.totalLimpiadas) && 
                                            this.getBotonAddParte('MONTAJE', part)
                                        }
                                        
                                    </View>
                                    <View style={{ ...styles.col, width: '20%', textAlign:'center', padding:5}}>
                                        { currentStage.currentTask && (currentStage.currentTask.task === 'GIRO' || currentStage.currentTask.task === 'MONTAJE' )
                                            //&& currentStage.currentTask.finishDate === null
                                            && part.botadas === part.limpiadas &&  (part.montadas > 0 || part.totalMontadas < part.totalLimpiadas || part.botadas > 0) &&
                                            <Text style={{fontSize:20, padding:1, color: StylesGlobal.colorBlack, textAlign:'center', backgroundColor: StylesGlobal.colorGray25, width:'100%'}}>
                                                {part.montadas}
                                            </Text>
                                        }
                                    </View>
                                    { currentStage.currentTask && (currentStage.currentTask.task === 'GIRO' || currentStage.currentTask.task === 'MONTAJE' )
                                        //&& currentStage.currentTask.finishDate === null
                                        && part.botadas === part.limpiadas &&  (part.montadas > 0 || part.totalMontadas < part.totalLimpiadas || part.botadas > 0) &&
                                        <View style={{ ...styles.col, width: '25%', padding:5}}>
                                            <Text style={{fontSize:18, padding:1, color: StylesGlobal.colorBlack, textAlign:'center', backgroundColor: StylesGlobal.colorGray25, width:'95%'}}>
                                                {part.totalLimpiadas - part.totalMontadas}
                                            </Text>
                                        </View>
                                    }
                                </View>
                            </React.Fragment>
                        )
                    )}
                    </ScrollView>
                </>
                :
                <>
                </>
                }
            </View>
        )
    }
}