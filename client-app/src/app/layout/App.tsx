import React, { useState, useEffect, Fragment } from "react";
import { Container } from "semantic-ui-react";
import axios from "axios";
import { IActivity } from "../models/activity";
import { Navbar } from "../../features/nav/Navbar";
import { ActivityDashBoard } from "../../features/activities/dashboard/ActivityDashBoard";

// interface IState {
//   activities: IActivity[];
// }

const App = () => {
  // readonly state: IState = {
  //   activities: [],
  // };
  const [activities, setActivites] = useState<IActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(
    null
  );
  const [editMode, setEditMode] = useState(false);

  const handleSelectActivity = (id: string) => {
    setSelectedActivity(activities.filter((a) => a.id === id)[0]);
    setEditMode(false);
  };

  const handleOpenCreateForm = () => {
    setSelectedActivity(null);
    setEditMode(true);
  };

  // componentDidMount() {
  //   axios.get<IActivity[]>("http://localhost:5000/api/activities").then((response) => {
  //     // console.log(response);
  //     this.setState({
  //       activities: response.data,
  //     });
  //   });
  // }

  const handleCreateActivity = (activity: IActivity) => {
    setActivites([...activities, activity]);
    setSelectedActivity(activity);
    setEditMode(false);
  };

  const handleEditActivity = (activity: IActivity) => {
    setActivites([...activities.filter((a) => a.id !== activity.id), activity]);
    setSelectedActivity(activity);
    setEditMode(false);
  };

  const handleDeleteActivity =(id:string) =>{
    setActivites([...activities.filter(a => a.id !== id)])
  }

  useEffect(() => {
    axios
      .get<IActivity[]>("http://localhost:5000/api/activities")
      .then((response) => {
        // console.log(response);
        let activities: IActivity[] = [];
        response.data.forEach((activity) => {
          activity.date = activity.date.split(".")[0];
          activities.push(activity);
        });
        setActivites(activities);
      });
  }, []);

  // render() {
  return (
    <Fragment>
      <Navbar openCreateForm={handleOpenCreateForm} />
      <Container style={{ marginTop: "7em" }}>
        <ActivityDashBoard
          activities={activities}
          selectActivity={handleSelectActivity}
          selectedActivity={selectedActivity}
          editMode={editMode}
          setEditMode={setEditMode}
          setSelectedActivity={setSelectedActivity}
          createActivity={handleCreateActivity}
          editActivity={handleEditActivity}
          deleteActivity={handleDeleteActivity}
        />
      </Container>
    </Fragment>
  );
};
// }

export default App;
