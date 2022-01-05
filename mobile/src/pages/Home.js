import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text
} from 'react-native';
import {  ListItem } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';

import { getTurnosActivosPromise } from './promises';
import StylesGlobal from './StylesGlobal';
import { TurnoPage } from '.';

const styles = StyleSheet.create({
    primaryButton: {
        position: 'absolute',
        right: 5,
    },
})

export default class Home extends Component {
    state = {
        turnos: null,
        turno: null
    }

    async componentDidMount() {
        let _turnos = await getTurnosActivosPromise()
        if(_turnos) {
            _turnos.map(t => {
                let otro = false
                t.molino.turns.map(t2 => {
                    if(t2.id !== t.id && t2.status === 'OPEN') {
                        otro = true
                    }
                })
                t.enable = !otro
                t.return = true
            })
        }
        this.setState({
            turnos: _turnos
        })
        if(_turnos.length === 1 && _turnos[0].enable) {
            _turnos[0].return = false
            this.setState({
                turno: _turnos[0]
            })
        }
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
            <View style={{height:'100%'}}>
                { turnos === null ? <Spinner />
                :
                <>
                    { turno === null ?
                        <View>
                            { turnos.length > 0 ?
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
                            :
                            <Text style={{padding:50, fontSize:30, fontWeight:'600', textAlign:'center', color: StylesGlobal.colorBlue}}>No hay molinos disponibles para mantención</Text>
                            }
                        </View>
                        :
                        <TurnoPage currentUser={currentUser} turno={turno} returnMenu={this.returnMenu.bind(this)} screenProps={this.props.screenProps} />
                    }
                </>
                }
            </View>
        )
    }
}