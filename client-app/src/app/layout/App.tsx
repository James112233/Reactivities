import React, {
  useEffect,
  Fragment,
  useContext,
} from "react";
import { Container } from "semantic-ui-react";
import Navbar from "../../features/nav/Navbar";
import ActivityDashBoard from "../../features/activities/dashboard/ActivityDashBoard";
import LoadingComponent from "./LoadingComponent";
import ActivityStore from "../../app/stores/activityStore";
import { observer } from "mobx-react-lite";

// interface IState {
//   activities: IActivity[];
// }

const App = () => {
  const activityStore = useContext(ActivityStore);

  useEffect(() => {
    activityStore.loadActivities();
  }, [activityStore]);

  if (activityStore.loadingInitial)
    return <LoadingComponent content="Loading..." />;

  // render() {
  return (
    <Fragment>
      <Navbar />
      <Container style={{ marginTop: "7em" }}>
        <ActivityDashBoard />
      </Container>
    </Fragment>
  );
};
// }

export default observer(App);
