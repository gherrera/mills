import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text
} from 'react-native';
import {  ListItem } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';
import LinearGradient from 'react-native-linear-gradient'

import { getTurnosActivosPromise } from './promises';
import StylesGlobal from './StylesGlobal';
import { TurnoPage } from '.';

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
})

export default class Home extends Component {
    state = {
        turnos: null,
        turno: null
    }

    async componentDidMount() {
        let _turnos = await getTurnosActivosPromise()
        console.log(_turnos)
        if(_turnos) {
            _turnos.map(t => {
                let otro = false
                t.molino.turns.map(t2 => {
                    if(t2.id !== t.id && t2.status === 'OPEN') {
                        otro = true
                    }
                })
                t.enable = !otro
            })
        }
        this.setState({
            turnos: _turnos
        })
    }

    clickMenu(turno) {
        if(turno.enable) {
            this.setState({
                turno: turno
            })
        }
    }

    returnMenu() {
        this.setState({
            turno: null
        })
    }

    render() {
        const { currentUser } = this.props
        const { turnos, turno } = this.state

        return (
            <View>
                { turnos === null && <Spinner /> }
                { turno === null ?
                    <View>
                        { turnos && turnos.length > 0 &&
                        <>
                            <Text style={{fontSize: 30, padding: 10, textAlign: 'center', color: StylesGlobal.colorBrown, fontWeight:'500'}}>Proyectos</Text>
                            { turnos.map(t =>
                                <ListItem key={t.id} bottomDivider onPress={() => this.clickMenu(t)}
                                    containerStyle={{backgroundColor: StylesGlobal.colorGray25}}
                                >
                                        <ListItem.Content>
                                            <ListItem.Title style={{ fontWeight: '600', fontSize:25 }}>
                                                {t.molino.name+' - ' +t.molino.faena.name+' - ' +t.name}
                                                {!t.enable && ' (No permitido)'}
                                            </ListItem.Title>
                                            <ListItem.Subtitle style={{ fontWeight: '600', fontSize:20 }}>{t.molino.faena.client.name}</ListItem.Subtitle>
                                        </ListItem.Content>
                                        <ListItem.Chevron />
                                </ListItem>
                            )}
                        </>
                        }
                    </View>
                    :
                    <TurnoPage currentUser={currentUser} turno={turno} closeTurno={this.returnMenu.bind(this)} />
                }
            </View>
        )
    }
}