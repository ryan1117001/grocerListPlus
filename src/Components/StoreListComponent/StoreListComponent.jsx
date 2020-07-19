import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { styles } from './StoreListComponent.styles'
import { List, Surface, IconButton, Provider } from 'react-native-paper';
import {
    db, deleteStore, deleteItemsByStoreId, selectStore, updateStoreType
} from '../../Utils/SQLConstants';
import PropTypes from 'prop-types';
import moment from 'moment'
import { storeType } from '../../Utils/TypeConstants';


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

    deleteStore = () => {
        db.transaction(tx => {
            console.debug('exec deleteItemsByStoreId')
            tx.executeSql(deleteItemsByStoreId, [this.state.id])
            console.debug('exec deleteStore')
            tx.executeSql(deleteStore, [this.state.id])
        },
            (error) => console.debug(error),
            () => {
                console.debug('parent refresh')
                this.props.forceRefreshFunction()
            }
        )
    }

    updateStoreType = (args) => {
        db.transaction(tx => {
            tx.executeSql(
                updateStoreType,
                args,
                () => {
                    console.debug('success')
                    this.props.forceRefreshFunction()
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
                            title={this.state.storeName}
                            description={this.state.dateToGo}
                            left={() =>
                                <IconButton
                                    icon={this.state.storeType === storeType.ARCHIVE ? 'archive-arrow-up' : 'archive-arrow-down'}
                                    onPress={this.onPressFunction}
                                />
                            }
                            right={() =>
                                <IconButton
                                    icon='trash-can-outline'
                                    onPress={this.deleteStore}
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
    navigation: PropTypes.object
}

StoreListComponent.defaultProps = {
    store: null,
    forceRefreshFunction: null,
    navigation: null
}

export default StoreListComponent