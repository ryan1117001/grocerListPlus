import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { styles } from './StoreListComponent.styles'
import { List, Surface, IconButton, Provider, Text } from 'react-native-paper';
import {
    db, updateItemsOnUpdateStoreType, updateStoreType
} from '../../Utils/SQLConstants';
import PropTypes from 'prop-types';
import moment from 'moment'
import { storeType, itemType } from '../../Utils/TypeConstants';


class StoreListComponent extends PureComponent {
    constructor(props) {
        super(props)
        console.debug(props)
        const date = moment(props.store.dateToGo).locale('en-US').format('l')

        this.state = {
            showMenuModal: false,
            id: props.store.id,
            storeName: props.store.storeName,
            storeType: props.store.storeType,
            dateToGo: date,
            storeNameText: '',
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.store !== this.props.store) {
            const date = moment(this.props.store.dateToGo).locale('en-US').format('l')
            this.setState({
                id: this.props.store.id,
                storeName: this.props.store.storeName,
                dateToGo: date
            });
        }
    }

    navigateToStoreItems = () => {
        this.props.navigation.navigate('StoreItems', {
            storeName: this.state.storeName,
            storeId: this.state.id,
            dateToGo: this.state.dateToGo,
        })
    }

    showMenuModal = () => {
        this.setState({
            showMenuModal: true
        })
    }

    hideMenuModal = () => {
        this.setState({
            showMenuModal: false
        })
    }

    updateItemsOnUpdateStoreType = () => {
        var args = []
        if (this.state.storeType === storeType.ARCHIVE) {
            args = [itemType.STORE, this.state.id, itemType.ARCHIVE]
        }
        else if (this.state.storeType === storeType.INUSE) {
            args = [itemType.ARCHIVE, this.state.id, itemType.STORE]
        }
        db.transaction(tx => {
            console.debug('exec updateItemsOnUpdateStoreType')
            tx.executeSql(updateItemsOnUpdateStoreType, args,
                () => {
                    console.debug('success')
                    this.props.forceRefreshFunction()
                },
                () => console.debug('error')
            )
        })
    }

    updateStoreType = (args) => {
        db.transaction(tx => {
            tx.executeSql(
                updateStoreType,
                args,
                () => {
                    console.debug('success')
                    this.updateItemsOnUpdateStoreType()
                },
                () => console.debug('error')
            )
        })
    }

    onPressFunction = () => {
        switch (this.state.storeType) {
            case storeType.ARCHIVE:
                console.debug('onPressFunction ARCHIVE')
                this.updateStoreType([storeType.INUSE, this.state.id])
                break
            case storeType.INUSE:
                console.debug('onPressFunction INUSE')
                this.updateStoreType([storeType.ARCHIVE, this.state.id])
                break
            default:
                console.debug('onPressFunction do nothing')
        }
    }

    render() {
        return (
            <Provider>
                <View style={styles.StoreListComponentWrapper} >
                    <Surface
                        key={this.state.id}
                        style={styles.Surface}>
                        <List.Item
                            onPress={this.navigateToStoreItems}
                            key={this.state.id}
                            title={<Text style={styles.storeTitle}>{this.state.storeName}</Text>}
                            description={this.state.dateToGo}
                            left={() =>
                                <IconButton
                                    icon={this.state.storeType === storeType.ARCHIVE ? 'arrow-left-bold-box-outline' : 'arrow-right-bold-box-outline'}
                                    onPress={this.onPressFunction}
                                />
                            }
                            right={() =>
                                <IconButton
                                    icon='trash-can-outline'
                                    onPress={() => this.props.showDeleteStoreConfirmationFunc(this.state.id)}
                                />
                            }
                        />
                    </Surface>
                </View>
            </Provider>
        )
    }
}

StoreListComponent.propTypes = {
    store: PropTypes.object,
    forceRefreshFunction: PropTypes.func,
    showDeleteStoreConfirmationFunc: PropTypes.func,
    navigation: PropTypes.object
}

StoreListComponent.defaultProps = {
    store: null,
    forceRefreshFunction: null,
    navigation: null
}

export default StoreListComponent