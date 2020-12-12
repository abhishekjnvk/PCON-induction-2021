import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import error403 from "./403.png";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import AccountCircle from "@material-ui/icons/ArrowLeft";

const useStyles = makeStyles({
  root: {
    maxWidth: 400,
    marginTop:'20vh'

  },
});

export default function Error403() {
  const classes = useStyles();

  return (
    <center>
      <Card className={classes.root}>
        <CardActionArea>
          <CardMedia
            component="img"
            alt="Contemplative Reptile"
            // height="140"
            image={error403}
            title="Contemplative Reptile"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              You are not authorized to view this page please login to continue
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <center>
            <Link to="/" className="text-dark">
              <AccountCircle />
              Go Back to Login
            </Link>
          </center>
        </CardActions>
      </Card>
    </center>
  );
}
