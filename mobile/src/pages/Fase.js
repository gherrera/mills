import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    Dimensions,
    ScrollView,
    Alert,
    StatusBar
} from 'react-native';
import {  Button } from 'react-native-elements';

import { startTaskPromise, finishTaskPromise, startEtapaPromise, addPartePromise } from './promises';
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

const {width, height} = Dimensions.get('window');
const metrics = {
    screenWidth: width < height ? width : height,
    screenHeight: width < height ? height : width,
};

export default class Fase extends Component {
    state = {
       turno: this.props.turno,
       isModalVisible: true,
       isLoading: {BOTADO: false, LIMPIEZA: false, MONTAJE: false},
       isModalStartExecution: false
    }

    componentDidMount() {
        const { turno } = this.props
        if(!turno.molino.showPendientes && (turno.molino.nextTask === 'RETIRO_CHUTE' || turno.molino.nextTask === 'ING_LAINERA') && turno.molino.currentStage.currentTask.finishDate) {
            this.setState({
                isModalStartExecution: true
            })
        }
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
                  { text: "Iniciar Tarea", onPress: () => {
                        const { turno } = this.state
                        startTaskPromise(turno.id, turno.molino.currentStage.stage).then(t => {
                            this.setState({
                                turno: t
                            })
                            this.props.callbackTasks(t, turno.molino.currentStage.stage)
                        })
                    }
                  }
                ]
            );
        }
    }

    finishTask() {
        const {t} = this.props.screenProps; 
        const molino = this.state.turno.molino
        if(molino.currentStage.currentTask) {
            if(molino.currentStage.currentTask.task === 'BOTADO' && molino.botadas === 0) {
                Alert.alert(
                    "Error", "Debe agregar piezas a la tarea de Botado antes de Finalizar"
                );
            }else {
                Alert.alert(
                    "Fin de Tarea",
                    "Confirma el Fin de la Tarea: " +t('messages.mills.task.'+molino.currentStage.currentTask.task)+ "?",
                    [
                    {
                        text: "Cancelar",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    },
                    { text: "Finalizar Tarea", onPress: () => {
                            const { turno } = this.state
                            finishTaskPromise(turno.id, turno.molino.currentStage.stage).then(t => {
                                this.setState({
                                    turno: t
                                })
                                if(t.molino.nextTask === 'RETIRO_CHUTE') {
                                    this.setState({
                                        isModalStartExecution: true
                                    })
                                }
                                this.props.callbackTasks(t, turno.molino.currentStage.stage)
                            })
                        }
                    }
                    ]
                );
            }
        }
    }

    startExecution() {
        this.startEtapa(true)
    }

    startEtapa(enablePendientes=false) {
        const { turno } = this.state
        startEtapaPromise(turno.id).then(t => {
            this.setState({
                turno: t,
                isModalStartExecution: false
            })
            if(enablePendientes) this.props.activaPendientes(t, true)
        })
    }

    addParte(stage, parteId) {
        const { isLoading } = this.state
        const { turno } = this.state
        isLoading[stage] = true
        this.setState({
            isLoading
        })
        addPartePromise(turno.id, stage, parteId).then(t => {
            isLoading[stage] = false
            this.setState({
                turno: t,
                isLoading
            })
        })
    }

    getBotonAddParte(stage, parteId) {
        const { isLoading } = this.state
        return (
            <Button
                icon={ {name:"pluscircleo", type:"antdesign", size:27} }
                buttonStyle={{
                    width: 37, 
                    height:27, 
                    padding: 0
                }}
                loading={isLoading[stage]}
                type="clear"
                onPress={() => this.addParte(stage, parteId)}
            />
        )
    }

    returnMenuHandler() {
        const { returnMenu } = this.props
        const { turno } = this.state
        const molino = turno.molino

        if(turno.open !== true) returnMenu()
        else if(molino.stage === 'FINISHED' && molino.status === 'FINISHED') {
            Alert.alert(
                "Finalizar turno",
                "Debe Finalizar el turno para salir"
            );
        }else returnMenu()
    }

    finalizarTurno() {
        this.props.finTurno()
        this.setState({isModalVisible: false})
        const { returnMenu } = this.props
        returnMenu()
    }

    render() {
        const { currentUser, returnMenu } = this.props
        const { turno, isModalVisible, isModalStartExecution } = this.state
        const {t, i18n} = this.props.screenProps; 
        const molino = turno.molino

        return (
            <View style={{height:'100%'}}>
                <Text style={{fontSize: 25, textAlign: 'center', color: StylesGlobal.colorBlack75, fontWeight:'600', top:0, position:'absolute', left: 0, width:'100%'}}>
                    { molino.stage === 'BEGINNING' ? "FASE INICIO"
                    : molino.stage === 'EXECUTION' ? "FASE EJECUCION"
                    : "FASE TERMINO"
                    }
                </Text>
                <Button
                    buttonStyle={{padding:0, width:30, height:30, backgroundColor:"transparent"}}
                    style={{color:"#000"}}
                    onPress={this.returnMenuHandler.bind(this)}
                    icon={{
                        name: "arrow-back-ios",
                        color: StylesGlobal.colorBlack75
                    }}
                />
                <View
                    style={{
                        borderBottomColor: StylesGlobal.colorBlack75,
                        borderBottomWidth: 1,
                        marginTop: 5,
                    }}
                />
                { isModalStartExecution &&
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
                            marginTop: (Dimensions.get('window').height-400)/2, 
                            borderRadius:15, 
                            padding:12,
                            borderColor:StylesGlobal.colorGray, 
                            borderWidth:3}}>
                            <Text style={{fontSize:25, padding:18, textAlign:'center', color: StylesGlobal.colorBlue}}>
                                Ha finalizado el proceso de 
                                { turno.molino.nextTask === 'RETIRO_CHUTE' ? " Bloqueo" 
                                : " Retiro Chute"
                                }
                                .
                            </Text>
                            <Text style={{fontSize:25, padding:18, textAlign:'center', color: StylesGlobal.colorBlue}}>
                                ¿Inicia la fase de Ejecución?
                            </Text>
                            <Button
                                title="Iniciar"
                                titleStyle={{fontSize:26, textAlign:'center'}}
                                buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'80%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10 }}
                                onPress={this.startExecution.bind(this)}
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
                { molino.stage === 'FINISHED' && molino.status === 'FINISHED' &&
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={isModalVisible}
                    >
                        <View style={{
                            backgroundColor: 'rgba(255,255,255,.97)', 
                            width:'85%', 
                            height:'40%', 
                            alignSelf:'center', 
                            marginTop: Dimensions.get('window').height*0.3, 
                            borderRadius:15, 
                            padding:12,
                            borderColor:StylesGlobal.colorGray, 
                            borderWidth:3}}>
                            <Text style={{fontSize:25, padding:18, textAlign:'center', color: StylesGlobal.colorBlue}}>
                                Ha finalizado todas las tareas de la mantención.
                            </Text>
                            <Button
                                title="Finalizar Turno"
                                titleStyle={{fontSize:26, textAlign:'center'}}
                                buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'80%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10, borderColor: StylesGlobal.colorGray, borderWidth:2 }}
                                onPress={this.finalizarTurno.bind(this)}
                            />
                        </View>
                    </Modal>
                }
                { (molino.stage === 'BEGINNING' || molino.stage === 'EXECUTION') &&
                <> 
                    { molino.currentStage.currentTask &&  molino.currentStage.currentTask.finishDate && molino.nextTask === null &&
                        <Modal
                            animationType="fade"
                            transparent={true}
                            visible={isModalVisible}
                        >
                            <View style={{
                                backgroundColor: 'rgba(255,255,255,.97)', 
                                width:'85%', 
                                height:'60%', 
                                alignSelf:'center', 
                                marginTop: Dimensions.get('window').height*0.2, 
                                borderRadius:15, 
                                padding:12,
                                borderColor:StylesGlobal.colorGray, 
                                borderWidth:3}}>
                                <Text style={{fontSize:25, padding:18, textAlign:'center', color: StylesGlobal.colorBlue}}>
                                    Ha finalizado todos los procesos de 
                                    { molino.stage === 'BEGINNING' ? " inicio" 
                                    : " ejecución"
                                    }
                                    .
                                </Text>
                                <Text style={{fontSize:25, padding:18, textAlign:'center', color: StylesGlobal.colorBlue}}>
                                    ¿Inicia la fase de 
                                    { molino.stage === 'BEGINNING' ? " Ejecución"
                                    : " Término"
                                    }
                                    ?
                                </Text>
                                <Button
                                    title="Iniciar"
                                    titleStyle={{fontSize:26, textAlign:'center'}}
                                    buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'80%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10 }}
                                    onPress={this.startEtapa.bind(this)}
                                />
                                <Button
                                    title="Finalizar Turno"
                                    titleStyle={{fontSize:26, textAlign:'center'}}
                                    buttonStyle={{backgroundColor:'rgba(0,0,0,0.9)', width:'80%', textAlign: 'center',alignSelf:'center',marginTop:20, borderRadius:10, borderColor: StylesGlobal.colorGray, borderWidth:2 }}
                                    onPress={this.finalizarTurno.bind(this)}
                                />
                            </View>
                        </Modal>
                    }
                </>
                }
                <Text style={{fontSize:19, backgroundColor: StylesGlobal.colorGray75, color: 'black', borderRadius:10, padding:7, textAlign:'center', marginTop: 10}}>
                    { molino.currentStage.currentTask &&  molino.currentStage.currentTask.finishDate === null && molino.currentStage.currentTask.task === 'MONTAJE' ?
                        "El proceso de Montaje finalizará automáticamente cuando registre todas las piezas"
                    : molino.currentStage.currentTask &&  molino.currentStage.currentTask.finishDate === null ?
                        "Finalice el proceso de " + t('messages.mills.task.'+molino.currentStage.currentTask.task)
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
                { (molino.stage === 'BEGINNING' 
                    || molino.stage === 'FINISHED' 
                    || (molino.stage === 'EXECUTION' && 
                        (molino.currentStage.currentTask === null || 
                            molino.currentStage.currentTask.task === 'BOTADO' || 
                            molino.currentStage.currentTask.task === 'GIRO' || 
                            (molino.nextTask === 'GIRO' && molino.currentStage.currentTask.finishDate !== null && molino.totalMontadas < molino.piezas)
                        )
                       )
                    ) &&
                    <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                        <View style={{ ...styles.col, width: '50%', textAlign:'center', padding:16}}>
                            <Button
                                title="Inicio"
                                type={molino.nextTask === null || (molino.currentStage.currentTask &&  molino.currentStage.currentTask.finishDate === null)?"clear":"solid"}
                                disabled={molino.nextTask === null || (molino.currentStage.currentTask &&  molino.currentStage.currentTask.finishDate === null)}
                                titleStyle={{fontSize:20}}
                                buttonStyle={{padding:5, borderColor: StylesGlobal.colorGray, borderWidth:1.4, borderRadius:5, backgroundColor: (molino.nextTask === null || (molino.currentStage.currentTask &&  molino.currentStage.currentTask.finishDate === null)) ? "transparent": "rgba(0,0,0,0.85)"}}
                                onPress={this.startTask.bind(this)}
                            />
                        </View>
                        <View style={{ ...styles.col, width: '50%', textAlign:'center', padding:16}}>
                            <Button
                                title="Fin"
                                type={!(molino.currentStage.currentTask &&  molino.currentStage.currentTask.finishDate === null)?"clear":"solid"}
                                disabled={!(molino.currentStage.currentTask &&  molino.currentStage.currentTask.finishDate === null)}
                                buttonStyle={{padding:5, borderColor: StylesGlobal.colorGray, borderWidth:1.4, borderRadius:5, backgroundColor: (molino.nextTask === null || (molino.currentStage.currentTask &&  molino.currentStage.currentTask.finishDate === null)) ? "rgba(0,0,0,0.85)": "transparent"}}
                                titleStyle={{fontSize:20}}
                                onPress={this.finishTask.bind(this)}
                            />
                        </View>
                    </View>
                }
                { false && molino.currentStage.currentTask && molino.currentStage.currentTask.finishDate === null &&
                    <Text style={{fontSize:20, color: StylesGlobal.colorBlue, borderRadius:10, textAlign:'center'}}>
                    { molino.currentStage.currentTask.finishDate === null && molino.currentStage.currentTask.task !== 'LIMPIEZA' ?
                        "Proceso de " + t('messages.mills.task.'+molino.currentStage.currentTask.task) + " en curso"
                    : molino.currentStage.currentTask.finishDate === null && molino.currentStage.currentTask.task === 'LIMPIEZA' ?
                        "Proceso de " + t('messages.mills.task.'+molino.currentStage.currentTask.task) + " y " + t('messages.mills.task.MONTAJE') +" en curso"
                    : molino.currentStage.currentTask &&
                        "Fin del proceso de " + t('messages.mills.task.'+molino.currentStage.currentTask.task)
                    }
                    </Text>
                }

                { (molino.stage === 'BEGINNING' || molino.stage === 'FINISHED') ?
                <>
                    <View
                        style={{
                            borderBottomColor: StylesGlobal.colorBlack75,
                            borderBottomWidth: 1,
                            marginTop: 13,
                        }}
                    />

                    <View style={{flexDirection: "row", flexWrap: "wrap"}} textAlign="flex-start">
                        { molino.stage === 'BEGINNING' &&
                        <>
                            <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                <Text style={{fontSize:22, color:StylesGlobal.colorBlue}}>{t('messages.mills.task.DET_PLANTA')}</Text>
                            </View>
                            <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                { molino.currentStage.currentTask &&
                                    <Text style={{fontSize:20, color: StylesGlobal.colorBlack, width:120, padding:5, backgroundColor:StylesGlobal.colorGray50, textAlign:'center'}}>
                                        { molino.currentStage.currentTask.task !== 'DET_PLANTA' ?
                                        "Finalizado"
                                        : molino.currentStage.currentTask.task === 'DET_PLANTA' && molino.currentStage.currentTask.finishDate === null ?
                                        "En curso"
                                        : 
                                        "Finalizado"
                                        }
                                    </Text>
                                }
                            </View>

                            <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                <Text style={{fontSize:22, color:StylesGlobal.colorBlue}}>{t('messages.mills.task.BLOQUEO_PRUEBA_ENERGIA_0')}</Text>
                            </View>
                            <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                { molino.currentStage.currentTask && molino.currentStage.currentTask.task !== 'DET_PLANTA' &&
                                    <Text style={{fontSize:20, color: StylesGlobal.colorBlack, width:120, padding:5, backgroundColor:StylesGlobal.colorGray50, textAlign:'center'}}>
                                        { molino.currentStage.currentTask.task !== 'BLOQUEO_PRUEBA_ENERGIA_0' ?
                                        "Finalizado"
                                        : molino.currentStage.currentTask.task === 'BLOQUEO_PRUEBA_ENERGIA_0' && molino.currentStage.currentTask.finishDate === null ?
                                        "En curso"
                                        : molino.currentStage.currentTask.task === 'BLOQUEO_PRUEBA_ENERGIA_0' &&
                                        "Finalizado"
                                        }
                                    </Text>
                                }
                            </View>

                            <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                <Text style={{fontSize:22, color:StylesGlobal.colorBlue}}>{t('messages.mills.task.RETIRO_CHUTE')}</Text>
                            </View>
                            <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                { molino.currentStage.currentTask && molino.currentStage.currentTask.task !== 'DET_PLANTA' && molino.currentStage.currentTask.task !== 'BLOQUEO_PRUEBA_ENERGIA_0' &&
                                    <Text style={{fontSize:20, color: StylesGlobal.colorBlack, width:120, padding:5, backgroundColor:StylesGlobal.colorGray50, textAlign:'center'}}>
                                        { molino.currentStage.currentTask.task !== 'RETIRO_CHUTE' ?
                                        "Finalizado"
                                        : molino.currentStage.currentTask.task === 'RETIRO_CHUTE' && molino.currentStage.currentTask.finishDate === null ?
                                        "En curso"
                                        : molino.currentStage.currentTask.task === 'RETIRO_CHUTE' &&
                                        "Finalizado"
                                        }
                                    </Text>
                                }
                            </View>

                            <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                <Text style={{fontSize:22, color:StylesGlobal.colorBlue}}>{t('messages.mills.task.ING_LAINERA')}</Text>
                            </View>
                            <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                { molino.currentStage.currentTask && molino.currentStage.currentTask.task === 'ING_LAINERA' &&
                                    <Text style={{fontSize:20, color: StylesGlobal.colorBlack, width:120, padding:5, backgroundColor:StylesGlobal.colorGray50, textAlign:'center'}}>
                                        { molino.currentStage.currentTask.finishDate === null ?
                                        "En curso"
                                        : 
                                        "Finalizado"
                                        }
                                    </Text>
                                }
                            </View>
                        </>
                        }
                        { molino.stage === 'FINISHED' &&
                        <>
                            <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                <Text style={{fontSize:22, color:StylesGlobal.colorBlue}}>{t('messages.mills.task.RET_LAINERA')}</Text>
                            </View>
                            <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                { molino.currentStage.currentTask &&
                                    <Text style={{fontSize:20, color:'white', width:120, padding:5, backgroundColor:StylesGlobal.colorBlue, textAlign:'center'}}>
                                        { molino.currentStage.currentTask.task !== 'RET_LAINERA' ?
                                        "Finalizado"
                                        : molino.currentStage.currentTask.task === 'RET_LAINERA' && molino.currentStage.currentTask.finishDate === null ?
                                        "En curso"
                                        : 
                                        "Finalizado"
                                        }
                                    </Text>
                                }
                            </View>

                            <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                <Text style={{fontSize:22, color:StylesGlobal.colorBlue}}>{t('messages.mills.task.INST_CHUTE')}</Text>
                            </View>
                            <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                { molino.currentStage.currentTask && molino.currentStage.currentTask.task !== 'RET_LAINERA' &&
                                    <Text style={{fontSize:20, color:'white', width:120, padding:5, backgroundColor:StylesGlobal.colorBlue, textAlign:'center'}}>
                                        { molino.currentStage.currentTask.task !== 'INST_CHUTE' ?
                                        "Finalizado"
                                        : molino.currentStage.currentTask.task === 'INST_CHUTE' && molino.currentStage.currentTask.finishDate === null ?
                                        "En curso"
                                        : molino.currentStage.currentTask.task === 'INST_CHUTE' &&
                                        "Finalizado"
                                        }
                                    </Text>
                                }
                            </View>

                            <View style={{ ...styles.col, width: '60%', textAlign:'center', padding:10}}>
                                <Text style={{fontSize:22, color:StylesGlobal.colorBlue}}>{t('messages.mills.task.DESBLOQUEO')}</Text>
                            </View>
                            <View style={{ ...styles.col, width: '40%', textAlign:'center', padding:10}}>
                                { molino.currentStage.currentTask && molino.currentStage.currentTask.task !== 'RET_LAINERA' && molino.currentStage.currentTask.task !== 'INST_CHUTE' &&
                                    <Text style={{fontSize:20, color:'white', width:120, padding:5, backgroundColor:StylesGlobal.colorBlue, textAlign:'center'}}>
                                        { molino.currentStage.currentTask.task !== 'DESBLOQUEO' ?
                                        "Finalizado"
                                        : molino.currentStage.currentTask.task === 'DESBLOQUEO' && molino.currentStage.currentTask.finishDate === null ?
                                        "En curso"
                                        : molino.currentStage.currentTask.task === 'DESBLOQUEO' &&
                                        "Finalizado"
                                        }
                                    </Text>
                                }
                            </View>
                        </>
                        }
                    </View>
                </>
                : // EXECUTION
                <>
                    <View style={{flexDirection: "row", flexWrap: "wrap", borderBottomColor: StylesGlobal.colorBlack, borderBottomWidth: 1, marginTop: 10, marginBottom: 5}} textAlign="flex-start">
                        <View style={{ ...styles.col, width: '55%', padding:5}}>
                            <Text style={{fontSize:18, color: StylesGlobal.colorBlack}}>
                                Giro: {turno.molino.giros+1}
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
                                        <Text style={{fontSize:18, color: 'white', width:'99%', padding:2, paddingLeft:10, backgroundColor:StylesGlobal.colorBlack75}}>
                                            {part.name}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: "row", flexWrap: "wrap", borderBottomColor: StylesGlobal.colorBlack, borderBottomWidth: indexType < turno.molino.partsByType.length-1 || indexPart < type.parts.length-1 ? 1:0, marginBottom: 5}}>
                                    <View style={{ ...styles.col, width: '40%', padding:5}}>
                                        <Text style={{fontSize:20, color:StylesGlobal.colorBlack}}>Botado</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '15%', textAlign:'center', padding:5}}>
                                        { molino.currentStage.currentTask && molino.currentStage.currentTask.task === 'BOTADO' 
                                            && molino.currentStage.currentTask.finishDate === null 
                                            && part.totalBotadas < part.qty &&
                                            this.getBotonAddParte('BOTADO', part.id)
                                        }
                                    </View>
                                    <View style={{ ...styles.col, width: '20%', padding:5}}>
                                        <Text style={{fontSize:18, padding:1, color: StylesGlobal.colorBlack, textAlign:'center', backgroundColor: StylesGlobal.colorGray25, width:'100%'}}>
                                            {part.botadas}
                                        </Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '25%', padding:5}}>
                                        <Text style={{fontSize:18, padding:1, color: StylesGlobal.colorBlack, textAlign:'center', backgroundColor: StylesGlobal.colorGray25, width:'95%'}}>
                                            {part.qty - part.totalBotadas}
                                        </Text>
                                    </View>

                                    <View style={{ ...styles.col, width: '40%', padding:5}}>
                                        <Text style={{fontSize:20, color:StylesGlobal.colorBlack}}>Limpieza</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '15%', textAlign:'center', padding:5}}>
                                        { molino.currentStage.currentTask && molino.currentStage.currentTask.task !== 'BOTADO' 
                                            && part.limpiadas < part.botadas &&
                                            this.getBotonAddParte('LIMPIEZA', part.id)
                                        }
                                    </View>
                                    <View style={{ ...styles.col, width: '20%', textAlign:'center', padding:5}}>
                                        { molino.currentStage.currentTask && molino.currentStage.currentTask.task !== 'BOTADO' && part.botadas > 0 &&
                                            <Text style={{fontSize:20, padding:1, color: StylesGlobal.colorBlack, textAlign:'center', backgroundColor: StylesGlobal.colorGray25, width:'100%'}}>
                                                {part.limpiadas}
                                            </Text>
                                        }
                                    </View>

                                    <View style={{ ...styles.col, width: '40%', padding:5}}>
                                        <Text style={{fontSize:20, color:StylesGlobal.colorBlack}}>Montaje</Text>
                                    </View>
                                    <View style={{ ...styles.col, width: '15%', textAlign:'center', padding:5}}>
                                        { molino.currentStage.currentTask && molino.currentStage.currentTask.task !== 'BOTADO' 
                                            && part.montadas < part.botadas && part.botadas === part.limpiadas && 
                                            this.getBotonAddParte('MONTAJE', part.id)
                                        }
                                    </View>
                                    <View style={{ ...styles.col, width: '20%', textAlign:'center', padding:5}}>
                                        { molino.currentStage.currentTask && molino.currentStage.currentTask.task !== 'BOTADO'
                                            && part.botadas === part.limpiadas && part.botadas > 0 &&
                                            <Text style={{fontSize:20, padding:1, color: StylesGlobal.colorBlack, textAlign:'center', backgroundColor: StylesGlobal.colorGray25, width:'100%'}}>
                                                {part.montadas}
                                            </Text>
                                        }
                                    </View>
                                </View>
                            </React.Fragment>
                        )
                    )}
                    </ScrollView>
                </>
                }
            </View>
        )
    }
}