import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import { Provider } from 'react-native-paper';
import { styles } from './ArchiveStorePage.styles';
import {
  db, selectStoresByStoreType
} from '../../Utils/SQLConstants';
import StoreListComponent from '../../Components/StoreListComponent/StoreListComponent'
import { storeType } from '../../Utils/TypeConstants';

class ArchiveStorePage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      storeNameText: '',
      data: [],
      isRefreshing: false,
    };
  }

  componentDidMount = () => {
		this._unsubscribe = this.props.navigation.addListener('focus', () => {
			this.queryStores()
		})
	}

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
  }

  componentDidUpdate = () => {
    console.log('ArchiveStorePage did update');
  }

  componentWillUnmount = () => {
    console.log('ArchiveStorePage will unmount');
  }

  forceRefresh = () => {
    this.setState({
      isRefreshing: true
    })
    this.queryStores()
    this.setState({
      isRefreshing: false
    })
  }

  queryStores() {
    console.debug('exec queryStores')
    db.transaction(tx => {
      tx.executeSql(
        selectStoresByStoreType,
        [storeType.ARCHIVE],
        (_, { rows: { _array } }) => {
          console.debug(_array)
          this.setState({
            data: _array
          })
          console.debug('success')
        },
        () => console.debug("Error")
      )
    })
  }

  render() {
    return (
      <Provider>
        <FlatList
          style={styles.HomePageWrapper}
          onRefresh={this.forceRefresh}
          refreshing={this.state.isRefreshing}
          data={this.state.data}
          renderItem={({ item, index, seperator }) => (
            <StoreListComponent
              key={item.id}
              store={item}
              forceRefreshFunction={this.forceRefresh}
              navigation={this.props.navigation}
            />
          )}
        />
      </Provider >
    );
  }
}

ArchiveStorePage.propTypes = {
  // bla: PropTypes.string,
};

ArchiveStorePage.defaultProps = {
  // bla: 'test',
};

export default ArchiveStorePage;
