import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    StoreItemsPageWrapper: {
        flex: 1,
    },
    HeaderWrapper: {
        flexDirection: 'row'
    },
    CalendarWrapper: {
        height: 330
    },
    TitleRowWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 2
    },
    UserInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    Fab: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        margin: 16
    },
    Surface: {
        marginVertical: 1,
        elevation: 4,
    }
});
