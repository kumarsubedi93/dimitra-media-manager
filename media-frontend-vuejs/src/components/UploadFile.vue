<script>
import InputElement from './InputElement.vue'
import { API_CLIENT, BASE_URL } from '../services/http'

export default {
    name: 'upload-file',
    data() {
        return {
            files: [{
                value: '',
                initial: true
            }],
            loading: false,
            outputFiles: [],
        }
    },
    components: {
        InputElement: InputElement
    },
    mounted() {
        this.getFiles()
    },
    computed: {
        images() {
            return this.outputFiles.filter(item => {
                return !item.file.includes('.mp3') && !item.file.includes('.mp4')
            })
        },
        mp3s() {
            return this.outputFiles.filter(item => {
                return item.file.includes('.mp3')
            })
        },
        mp4s() {
            return this.outputFiles.filter(item => {
                return item.file.includes('.mp4')
            })
        }
    },
    methods: {
        downloadFile(id, file) {
            API_CLIENT.get(this.fileUrl(file), {
                responseType: 'blob',
            }).then(async (res) => {
                 console.log(res.data)
                const fileURL = window.URL.createObjectURL(res.data);
                const fileLink = document.createElement('a');
                fileLink.href = fileURL;
                fileLink.setAttribute('download', file);
                document.body.appendChild(fileLink);
                fileLink.click();
            }).catch(err => err)
        },
        initialFileInput() {
            return this.files = [{
                value: '',
                initial: true
            }]
        },
        getFiles() {
            API_CLIENT.get('/api/medias').then(res => {
                this.outputFiles = res.data.data
            }).catch(err => err)
        },
        deleteFile(id) {
            API_CLIENT.delete(`/api/delete-media/${id}`).then(res => {
                this.getFiles()
            }).catch(err => {
                //do stuff
            })
        },
        addMoreFile() {
            this.files.push({
                value: '',
                initial: false
            })
        },
        removeFile(index) {
            this.files.splice(index, 1)
        },
        handleFileUploadInput(params) {
            this.files[params.index].value = params.value
        },
        saveFile() {
            const isValidForm = this.files.every(x => {
                return x.value
            })
            if (!isValidForm) {
                return;
            }

            const formData = new FormData()
            this.files.forEach((file, index) => {
                formData.append(`file`, file.value);
            })
            this.loading = true
            API_CLIENT.post('/api/upload', formData).then(res => {
                this.getFiles()
                this.loading = false
                this.files = this.initialFileInput()
            }).catch(err => {
                this.loading = false
            })
        },
        fileUrl(file) {
            return `${BASE_URL}/${file}`
        }
    }
}
</script>

<style scoped>
.v-card {
    padding: 0px;
}

.mar-left-30 {
    margin-left: 30px;
}

.audio-box {
    padding: 5px;
}

audio::-webkit-media-controls-panel {
    background-color: none;
}

.mr-3 {
    margin-left: 3px;
    margin-bottom: 5px;
}

.v-row-with-border {
    border-color: rgba(var(--v-border-color), var(--v-border-opacity));
    border-style: solid;
    border-width: 1px;
    border-radius: 4px;
    padding: 46px;
}
</style>

<template>
    <v-container :fluid="true">
        <v-row no-gutters class="v-row-with-border">
            <v-col md="5">
                <v-card title="Upload Files">
                    <v-card-item>
                        <InputElement v-for="(file, index)  in files" v-bind:initial="file.initial"
                            v-bind:inputValue="file.value" v-bind:index="index" v-bind:key="index"
                            @addMoreFile="addMoreFile" @removeFile="removeFile" @fileUploadInput="handleFileUploadInput">
                        </InputElement>
                        <v-btn variant="tonal" :loading="loading" @click="saveFile" prepend-icon="mdi-check-circle">
                            Save
                            <template v-slot:loader>
                                <v-progress-linear indeterminate></v-progress-linear>
                            </template>
                        </v-btn>
                    </v-card-item>
                </v-card>
            </v-col>

            <v-col md="5" class="mar-left-30" v-if="outputFiles.length">
                <div class="image-priview" v-if="images.length">
                    <h3> Images Files </h3>
                    <v-row no-gutters>
                        <v-col md="5" class="mr-3" v-for="file in images">
                            <v-card class="mx-auto" max-width="400">
                                <v-img :width="309" :height="225" aspect-ratio="4/3" cover
                                    :src="fileUrl(file.file)"></v-img>
                                <v-btn color="red" class="ma-2" icon="mdi-minus" @click="deleteFile(file.id)">
                                </v-btn>
                                <v-btn color="blue" class="ma-2" icon="mdi-download"
                                    @click="downloadFile(file.id, file.file)">
                                </v-btn>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>

                <div class="image-priview" v-if="mp4s.length">
                    <h3> MP4 Files </h3>
                    <v-row no-gutters>
                        <v-col md="5" class="mr-3" v-for="file in mp4s">
                            <v-card class="mx-auto" max-width="400">
                                <video width="309" controls>
                                    <source :src="fileUrl(file.file)">
                                </video>
                                <v-btn color="red" class="ma-2" icon="mdi-minus" @click="deleteFile(file.id)">
                                </v-btn>
                                <v-btn color="blue" class="ma-2" icon="mdi-download"
                                    @click="downloadFile(file.id, file.file)">
                                </v-btn>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>

                <div class="image-priview" v-if="mp3s.length">
                    <h3> MP3 Files </h3>
                    <v-row no-gutters>
                        <v-col md="5" class="mr-3" v-for="file in mp3s">
                            <v-card class="mx-auto audio-box" max-width="400">
                                <audio controls>
                                    <source :src="fileUrl(file.file)" type="audio/mpeg">
                                    Your browser does not support the audio element.
                                </audio>
                                <v-btn color="red" class="ma-2" icon="mdi-minus" @click="deleteFile(file.id)">
                                </v-btn>
                                <v-btn color="blue" class="ma-2" icon="mdi-download"
                                    @click="downloadFile(file.id, file.file)">
                                </v-btn>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>


            </v-col>
        </v-row>
    </v-container>
</template>