import React, { Component } from 'react';
import { FaRegThumbsUp, FaRegThumbsDown } from 'react-icons/fa';
import {
    NotificationContainer,
    NotificationManager,
} from 'react-notifications';
// import { Multiselect } from 'multiselect-react-dropdown';
import './search.css';
import './styles.css';
// import '../forms.css';
import 'react-notifications/lib/notifications.css';
import default_profile_pic from '../../../images/default_profile_pic.png';

// class match extends Component {
// constructor(props) {
//     super(props);
//     this.state = {
//         plainArray: ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
//         objectArray: [
//           { key: "Option 1", cat: "Group 1" },
//           { key: "Option 2", cat: "Group 1" },
//           { key: "Option 3", cat: "Group 1" },
//           { key: "Option 4", cat: "Group 2" },
//           { key: "Option 5", cat: "Group 2" },
//           { key: "Option 6", cat: "Group 2" },
//           { key: "Option 7", cat: "Group 2" }
//         ],
//         selectedValues: [
//           { key: "Option 1", cat: "Group 1" },
//           { key: "Option 2", cat: "Group 1" }
//         ]
//       };
//       this.style = {
//         chips: {
//           background: "red"
//         },
//         searchBox: {
//           border: "none",
//           "border-bottom": "1px solid blue",
//           "border-radius": "0px"
//         },
//         multiselectContainer: {
//           color: "red"
//         }
//       };
//       this.addItem = this.addItem.bind(this);
//     }
//     addItem() {
//       this.selectedValues.push({ key: "Option 3", cat: "Group 1" });
//     }

//         render() {
//             const { plainArray, objectArray, selectedValues } = this.state;
//                 return (
//                     <div>
//                         <div className="container" >
//                             <input type="text" placeholder="Search..."/>
//                     <div className="examples col-12 col-md-5">
//                             <Multiselect
//                                 options={objectArray}
//                                 displayValue="key"
//                                 groupBy="cat"
//                                 showCheckbox={true}
//                             />

//                         </div>
//                         <code className="displayBlock mt10">
//                             &lt;Multiselect
//                             <br />
//                             &nbsp;&nbsp;options=&#123;objectArray}
//                             <br />
//                             &nbsp;&nbsp;groupBy="cat"
//                             <br />
//                             &nbsp;&nbsp;displayValue="key"
//                             <br />
//                             &nbsp;&nbsp;showCheckbox=&#123;true}
//                             <br />
//                             />
//                         </code>

//                         <button class="like__btn">
//                             <span id="icon"><FaRegThumbsUp/></span>
//                             <span> </span>
//                             Like
//                         </button>
//                         <button class="dislike__btn">
//                             <span id="icon"><FaRegThumbsDown/></span>
//                             <span> </span>
//                             Dislike
//                         </button>
//                     </div>

//                     </div>

//       );
//     }
// }

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: '',
            name: '',
            bio: '',
            age: '',
            gender: '',
            address: '',
            img: '',
            interests: [],
            filters: {},
        };
        // this.handleChange = this.handleChange.bind(this);
        // this.handleSubmit = this.handleSubmit.bind(this);
    }

    getUserData = async () => {
        const response = await fetch('/api/users/getUserData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userToken: localStorage.getItem('token'),
            }),
        });

        const body = await response.json();

        if (response.status !== 200) {
            alert(body);
        } else {
            return body;
        }
    };

    handleLike = async (event) => {
        event.preventDefault();

        const response = await fetch('/api/users/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                id: this.state.id,
            }),
        });

        const body = await response.text();

        if (response.status !== 200) {
            alert(body);
        } else if (body){
            NotificationManager.success(
                'View your matches to send them a message.',
                'Match!',
                3000
            );
            setTimeout(() => {
                window.location.reload(false);
            }, 1000);
        } else {
            // console.log(body);
            window.location.reload(false);
        }
    };

    handleDislike = async (event) => {
        event.preventDefault();

        const response = await fetch('/api/users/dislike', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                id: this.state.id,
            }),
        });

        if (response.status !== 200) {
            alert(response);
        } else {
            window.location.reload(false);
        }
    };

    componentDidMount = async () => {
        const user = await this.getUserData();

        let response = await fetch('/api/users/getUsers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                minAge: user.filters.minAge,
                maxAge: user.filters.maxAge,
                gender: user.filters.gender,
                interests: user.filters.interests,
                distance: user.filters.distance,
            }),
        });

        let body = await response.json();

        if (response.status !== 200) {
            alert(body);
        } else {
            if (body) {
                this.setState({
                    id: body[0]._id,
                    name: body[0].name,
                    bio: body[0].bio,
                    age: body[0].age,
                    gender: body[0].gender,
                    address: body[0].location.address,
                    img: body[0].img,
                    interests: body[0].interests,
                });
            } else {
                alert(
                    'Out of potential matches in your area! :( Come back later'
                );
            }
        }
    };

    render() {
        function importAll(r) {
            return r.keys().map(r);
        }
        const Images = importAll(
            require.context('../../../uploads', false, /\.(png|jpe?g|svg)$/)
        );
        let profilePic;

        for (let i in Images) {
            if (
                Images[i].default.slice(14, 31) === this.state.img.slice(0, 17)
            ) {
                profilePic = Images[i].default;
            }
        }

        return (
            <div className="user-container">
                <div className="text-container">
                    <h2 className="name-text">{this.state.name}</h2>
                    <h4 className="bio-text">"{this.state.bio}"</h4>
                    <h4 className="content-text"><span className="title-text">Age:</span> &nbsp;{this.state.age}</h4>
                    <h4 className="content-text"><span className="title-text">Gender:</span> &nbsp;{this.state.gender}</h4>
                    <h4 className="content-text"><span className="title-text">Interests:</span> &nbsp;{(this.state.interests).join(", ")}</h4>
                    <h4 className="content-text"><span className="title-text">Address:</span> &nbsp;{this.state.address}</h4>
                </div>
                <img
                    className="profile_pic"
                    src={this.state.img ? profilePic : default_profile_pic}
                    alt="Profile Pic"
                />
                <button className="like__btn" onClick={this.handleLike}>
                    <span id="icon">
                        <FaRegThumbsUp />
                    </span>
                    <span> </span>
                    Like
                </button>
                <button className="dislike__btn" onClick={this.handleDislike}>
                    <span id="icon">
                        <FaRegThumbsDown />
                    </span>
                    <span> </span>
                    Dislike
                </button>
                <NotificationContainer />
            </div>
        );
    }
}

export default Search;
