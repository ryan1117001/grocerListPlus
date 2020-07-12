import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { styles } from './StoreListComponent.styles'
import { List, Surface, Divider, Menu, IconButton, Provider, TextInput, Portal, Button } from 'react-native-paper';
import { navigate } from '../../Utils/RootNavigation';
import {
    db, deleteStore, deleteItemsByStoreId, selectStore
} from '../../Utils/SQLConstants';
import PropTypes from 'prop-types';
import moment from 'moment'


class StoreListComponent extends PureComponent {
    constructor(props) {
        super(props)
        const date = moment(props.store.dateToGo).locale('en-US').format('l')

        this.state = {
            showEditStoreModal: false,
            showMenuModal: false,
            id: props.store.id,
            storeName: props.store.storeName,
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
        navigate('storeItems', {
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

    forceRefreshStore = () => {
        db.transaction(tx => {
            console.debug('forceRefreshStore')
            tx.executeSql(selectStore, [this.state.id],
                (_, { rows: { _array } }) => {
                    console.debug(_array)
                },
                () => console.debug('error'))
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
                            right={() =>
                                <IconButton
                                    icon='trash-can-outline'
                                    onPress={this.deleteStore}>
                                        Delete
                                </IconButton>
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
    editStoreFunction: PropTypes.func
}

StoreListComponent.defaultProps = {
    store: null,
    forceRefreshFunction: null,
    editStoreFunction: null
}

export default StoreListComponent